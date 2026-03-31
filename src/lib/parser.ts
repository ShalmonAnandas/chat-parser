import {
  ParsedSession,
  ParsedMessage,
  ToolCall,
  ToolCategory,
  ThinkingBlock,
  TextEdit,
  InlineReference,
  UsedContext,
  RawChatExport,
  RawSessionV1,
  RawSessionV2,
  RawRequestV1,
  RawMessageV2,
  RawResponseValue,
  RawToolCallV1,
} from '@/types/chat';

function generateId(): string {
  return `msg_${crypto.randomUUID().slice(0, 16)}`;
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

/** Categorize a tool by its toolId or name */
function categorizeToolCall(toolId?: string, name?: string): ToolCategory {
  const id = (toolId ?? name ?? '').toLowerCase();
  if (id.includes('readfile') || id.includes('read_file') || id === 'copilot_readfile') return 'file-read';
  if (
    id.includes('createfile') ||
    id.includes('replacestring') ||
    id.includes('multireplacestring') ||
    id.includes('create_file') ||
    id === 'copilot_createfile' ||
    id === 'copilot_replacestring' ||
    id === 'copilot_multireplacestring'
  )
    return 'file-write';
  if (
    id.includes('findfiles') ||
    id.includes('findtextinfiles') ||
    id.includes('listdirectory') ||
    id.includes('geterrors') ||
    id === 'copilot_findfiles' ||
    id === 'copilot_findtextinfiles' ||
    id === 'copilot_listdirectory' ||
    id === 'copilot_geterrors' ||
    id === 'tool_search'
  )
    return 'file-search';
  if (id.includes('terminal') || id === 'run_in_terminal') return 'terminal';
  if (id === 'execution_subagent') return 'subagent';
  return 'other';
}

/** Extract a clean description from invocationMessage or pastTenseMessage */
function extractDescription(msg?: { value?: string }): string | undefined {
  if (!msg?.value) return undefined;
  // Strip markdown links: [text](url) → text
  return msg.value.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim() || undefined;
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
    category: categorizeToolCall(undefined, tc.name),
    arguments: args,
    result,
    isError,
  };
}

/** Parse the new VS Code format where response is an array of kind-tagged items */
function parseNewFormatResponse(responseItems: RawResponseValue[]): {
  content: string;
  toolCalls: ToolCall[];
  thinkingBlocks: ThinkingBlock[];
  textEdits: TextEdit[];
  inlineReferences: InlineReference[];
} {
  let content = '';
  const toolCalls: ToolCall[] = [];
  const thinkingBlocks: ThinkingBlock[] = [];
  const textEdits: TextEdit[] = [];
  const inlineReferences: InlineReference[] = [];

  for (const item of responseItems) {
    const kind = item.kind;

    switch (kind) {
      case 'markdownContent': {
        content += typeof item.value === 'string' ? item.value : '';
        break;
      }

      case 'thinking': {
        const value = typeof item.value === 'string' ? item.value : '';
        if (value) {
          thinkingBlocks.push({ id: item.id, content: value });
        }
        break;
      }

      case 'toolInvocationSerialized': {
        const tc: ToolCall = {
          id: item.toolCallId,
          name: item.toolId ?? 'unknown',
          toolId: item.toolId,
          category: categorizeToolCall(item.toolId),
          description: extractDescription(item.invocationMessage),
          pastTenseDescription: extractDescription(item.pastTenseMessage),
          isError: false,
        };
        toolCalls.push(tc);
        break;
      }

      case 'textEditGroup': {
        const path = item.uri?.path ?? item.uri?.fsPath ?? 'unknown';
        const fileName = path.split('/').pop() ?? path;
        textEdits.push({
          uri: path,
          fileName,
          editCount: Array.isArray(item.edits) ? item.edits.length : 0,
          done: item.done ?? false,
        });
        break;
      }

      case 'inlineReference': {
        const refName = item.name ?? '';
        const refPath = item.inlineReference?.path ?? item.inlineReference?.fsPath ?? '';
        if (refName || refPath) {
          inlineReferences.push({ name: refName, path: refPath });
        }
        break;
      }

      case 'toolCall': {
        if (item.value && typeof item.value === 'object' && !Array.isArray(item.value)) {
          const rawTc = item.value as RawToolCallV1;
          if (rawTc.name) {
            toolCalls.push(parseToolCallV1(rawTc));
          }
        }
        break;
      }

      // progressTaskSerialized, confirmation, questionCarousel, mcpServersStarting,
      // codeblockUri, undoStop – we just skip these or could add them later
      default: {
        // Try to extract text content from unknown kinds
        if (typeof item.value === 'string' && kind !== 'mcpServersStarting' && kind !== 'undoStop') {
          content += item.value;
        } else if (item.content && typeof item.content === 'string') {
          content += item.content;
        }
        break;
      }
    }
  }

  return { content, toolCalls, thinkingBlocks, textEdits, inlineReferences };
}

function parseV1Format(raw: RawSessionV1): ParsedSession {
  const messages: ParsedMessage[] = [];
  const requests = raw.requests ?? [];

  for (let i = 0; i < requests.length; i++) {
    const req = requests[i] as RawRequestV1;

    // Timestamps: prefer top-level timestamp (new format), fallback to message.timestamp
    const userTs = parseTimestamp(req.timestamp) ?? parseTimestamp(req.message?.timestamp);
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

    // Assistant response
    const resp = req.response;
    const responseIsArray = Array.isArray(resp);
    const responseValues = responseIsArray ? (resp as unknown as RawResponseValue[]) : undefined;
    const responseObj = !responseIsArray && resp ? resp : undefined;

    if (responseValues || responseObj) {
      let content = '';
      let toolCalls: ToolCall[] = [];
      let thinkingBlocks: ThinkingBlock[] = [];
      let textEdits: TextEdit[] = [];
      let inlineReferences: InlineReference[] = [];

      if (responseValues) {
        // New format: response is array of kind-tagged items
        const parsed = parseNewFormatResponse(responseValues);
        content = parsed.content;
        toolCalls = parsed.toolCalls;
        thinkingBlocks = parsed.thinkingBlocks;
        textEdits = parsed.textEdits;
        inlineReferences = parsed.inlineReferences;
      } else if (responseObj) {
        if (responseObj.value && Array.isArray(responseObj.value)) {
          const parsed = parseNewFormatResponse(responseObj.value);
          content = parsed.content;
          toolCalls = parsed.toolCalls;
          thinkingBlocks = parsed.thinkingBlocks;
          textEdits = parsed.textEdits;
          inlineReferences = parsed.inlineReferences;
        } else if (responseObj.text) {
          content = responseObj.text;
        }
      }

      // Parse used context
      const usedContext: UsedContext[] = (req.usedContext ?? []).map((ctx) => ({
        uri: ctx.document?.uri?.path,
        fileName: ctx.document?.fileName,
        range: ctx.ranges?.[0]
          ? { startLine: ctx.ranges[0].startLine ?? 0, endLine: ctx.ranges[0].endLine ?? 0 }
          : undefined,
      }));

      // Time taken: prefer result.timings (new format), then response fields, then diff
      const timeTaken =
        req.result?.timings?.totalElapsed ??
        responseObj?.timeTaken ??
        responseObj?.result?.timings?.totalElapsed ??
        (userTs && assistantTs ? assistantTs - userTs : undefined);

      // Model: prefer top-level modelId (new format), then response fields
      const agentName =
        typeof req.agent === 'object' ? req.agent?.name : typeof responseObj?.agent === 'string' ? responseObj.agent : undefined;
      const model = req.modelId ?? responseObj?.model ?? agentName ?? raw.model;

      messages.push({
        id: generateId(),
        role: 'assistant',
        content,
        timestamp: userTs ? (timeTaken ? userTs + timeTaken : userTs) : assistantTs,
        timeTaken,
        model,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        thinkingBlocks: thinkingBlocks.length > 0 ? thinkingBlocks : undefined,
        textEdits: textEdits.length > 0 ? textEdits : undefined,
        inlineReferences: inlineReferences.length > 0 ? inlineReferences : undefined,
        usedContext: usedContext.length > 0 ? usedContext : undefined,
      });
    }
  }

  const createdAt = parseTimestamp(raw.creationDate) ?? parseTimestamp(requests[0]?.timestamp);

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
        category: categorizeToolCall(undefined, tc.function?.name),
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
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid JSON: expected an object or array');
  }

  const data = raw as RawChatExport;

  // Array format
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { messages: [], totalMessages: 0 };
    }
    // Check at least the first two elements (or all if < 2) to determine format
    const sample = data.slice(0, Math.min(data.length, 2));
    const isV1Array = sample.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        ('message' in item || 'response' in item) &&
        !('role' in item)
    );
    if (isV1Array) {
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
