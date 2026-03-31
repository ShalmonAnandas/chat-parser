import {
  ParsedSession,
  ParsedMessage,
  ToolCall,
  UsedContext,
  RawChatExport,
  RawSessionV1,
  RawSessionV2,
  RawRequestV1,
  RawMessageV2,
  RawResponseValue,
  RawToolCallV1,
} from '@/types/chat';

let messageIdCounter = 0;
function generateId(): string {
  return `msg_${++messageIdCounter}_${crypto.randomUUID().slice(0, 8)}`;
}

function parseTimestamp(ts?: string | number): number | undefined {
  if (ts == null) return undefined;
  if (typeof ts === 'number') return ts;
  const parsed = Date.parse(ts);
  return isNaN(parsed) ? undefined : parsed;
}

function extractTextContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in part) return String((part as { text?: unknown }).text ?? '');
        return '';
      })
      .join('');
  }
  return '';
}

function parseToolCallV1(tc: RawToolCallV1): ToolCall {
  let args: Record<string, unknown> | string | undefined;
  if (typeof tc.input === 'string') {
    try {
      args = JSON.parse(tc.input) as Record<string, unknown>;
    } catch {
      args = tc.input;
    }
  } else {
    args = tc.input;
  }

  let result: unknown;
  let isError = false;
  if (tc.result) {
    isError = !!tc.result.isError;
    const contentArr = tc.result.content;
    if (Array.isArray(contentArr)) {
      result = contentArr
        .map((c) => {
          if (typeof c === 'string') return c;
          if (c && typeof c === 'object' && 'text' in c) return String((c as { text?: unknown }).text ?? '');
          return '';
        })
        .join('');
    } else {
      result = tc.result;
    }
  }

  return {
    id: tc.toolCallId,
    name: tc.name ?? 'unknown',
    arguments: args,
    result,
    isError,
  };
}

function parseResponseValues(values: RawResponseValue[]): { text: string; toolCalls: ToolCall[] } {
  let text = '';
  const toolCalls: ToolCall[] = [];

  for (const val of values) {
    if (val.kind === 'markdownContent') {
      text += typeof val.value === 'string' ? val.value : '';
    } else if (val.kind === 'toolCall' && val.value && typeof val.value === 'object' && !Array.isArray(val.value)) {
      const rawTc = val.value as RawToolCallV1;
      if (rawTc.name) {
        toolCalls.push(parseToolCallV1(rawTc));
      }
    } else if (typeof val.value === 'string') {
      text += val.value;
    } else if (val.content) {
      text += val.content;
    }
  }

  return { text, toolCalls };
}

function parseV1Format(raw: RawSessionV1): ParsedSession {
  const messages: ParsedMessage[] = [];
  const requests = raw.requests ?? [];

  for (let i = 0; i < requests.length; i++) {
    const req = requests[i] as RawRequestV1;
    const userTs = parseTimestamp(req.message?.timestamp);
    const assistantTs = parseTimestamp(req.response?.timestamp);

    // User message
    const userText = req.message?.text ?? extractTextContent(req.message?.parts);
    if (userText) {
      messages.push({
        id: generateId(),
        role: 'user',
        content: userText,
        timestamp: userTs,
      });
    }

    // Assistant message
    const resp = req.response;
    if (resp) {
      let content = '';
      const toolCalls: ToolCall[] = [];

      if (resp.value && Array.isArray(resp.value)) {
        const parsed = parseResponseValues(resp.value);
        content = parsed.text;
        toolCalls.push(...parsed.toolCalls);
      } else if (resp.text) {
        content = resp.text;
      }

      // Parse used context
      const usedContext: UsedContext[] = (req.usedContext ?? []).map((ctx) => ({
        uri: ctx.document?.uri?.path,
        fileName: ctx.document?.fileName,
        range: ctx.ranges?.[0]
          ? { startLine: ctx.ranges[0].startLine ?? 0, endLine: ctx.ranges[0].endLine ?? 0 }
          : undefined,
      }));

      // Time taken
      const timeTaken =
        resp.timeTaken ??
        resp.result?.timings?.totalElapsed ??
        (userTs && assistantTs ? assistantTs - userTs : undefined);

      messages.push({
        id: generateId(),
        role: 'assistant',
        content,
        timestamp: assistantTs,
        timeTaken,
        model: resp.model ?? resp.agent ?? raw.model,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        usedContext: usedContext.length > 0 ? usedContext : undefined,
      });
    }
  }

  const createdAt = parseTimestamp(raw.creationDate);

  return {
    id: raw.sessionId,
    title: raw.title,
    createdAt,
    messages,
    model: raw.model,
    totalMessages: messages.length,
  };
}

function parseV2Format(raw: RawSessionV2): ParsedSession {
  const messages: ParsedMessage[] = [];
  const rawMessages = raw.messages ?? [];

  for (let i = 0; i < rawMessages.length; i++) {
    const msg = rawMessages[i] as RawMessageV2;
    const role = msg.role ?? 'user';
    if (role === 'system') continue;

    const content = extractTextContent(msg.content);
    const timestamp = parseTimestamp(msg.timestamp);

    // Calculate timeTaken from difference with next assistant message
    let timeTaken: number | undefined;
    if (role === 'user' && i + 1 < rawMessages.length) {
      const nextTs = parseTimestamp(rawMessages[i + 1].timestamp);
      if (timestamp && nextTs) timeTaken = nextTs - timestamp;
    }

    const toolCalls: ToolCall[] = (msg.tool_calls ?? []).map((tc) => {
      let args: Record<string, unknown> | string | undefined;
      if (tc.function?.arguments) {
        try {
          args = JSON.parse(tc.function.arguments) as Record<string, unknown>;
        } catch {
          args = tc.function.arguments;
        }
      }
      return {
        id: tc.id,
        name: tc.function?.name ?? 'unknown',
        arguments: args,
      };
    });

    messages.push({
      id: generateId(),
      role: role as 'user' | 'assistant',
      content,
      timestamp,
      timeTaken,
      model: i === 0 ? raw.model : undefined,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    });
  }

  const createdAt = parseTimestamp(raw.created_at);

  return {
    id: raw.id,
    title: raw.title,
    createdAt,
    messages,
    model: raw.model,
    totalMessages: messages.length,
  };
}

function parseRequestArray(requests: RawRequestV1[]): ParsedSession {
  return parseV1Format({ requests });
}

function parseMessageArray(messages: RawMessageV2[]): ParsedSession {
  return parseV2Format({ messages });
}

export function parseChatExport(raw: unknown): ParsedSession {
  messageIdCounter = 0;

  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid JSON: expected an object or array');
  }

  const data = raw as RawChatExport;

  // Array format
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { messages: [], totalMessages: 0 };
    }
    const first = data[0];
    if (first && typeof first === 'object' && ('message' in first || 'response' in first)) {
      return parseRequestArray(data as RawRequestV1[]);
    }
    return parseMessageArray(data as RawMessageV2[]);
  }

  // V1 format: has `requests` array
  if ('requests' in data && Array.isArray((data as RawSessionV1).requests)) {
    return parseV1Format(data as RawSessionV1);
  }

  // V2 format: has `messages` array
  if ('messages' in data && Array.isArray((data as RawSessionV2).messages)) {
    return parseV2Format(data as RawSessionV2);
  }

  throw new Error(
    'Unrecognized format: expected { requests: [...] } or { messages: [...] } or an array'
  );
}
