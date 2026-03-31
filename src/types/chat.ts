export interface ToolCall {
  id?: string;
  name: string;
  arguments?: Record<string, unknown> | string;
  result?: unknown;
  isError?: boolean;
}

export interface UsedContext {
  uri?: string;
  fileName?: string;
  range?: {
    startLine: number;
    endLine: number;
  };
  content?: string;
}

export interface PlanningPhase {
  steps: string[];
  rawContent?: string;
}

export interface ParsedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  timeTaken?: number; // ms
  model?: string;
  toolCalls?: ToolCall[];
  usedContext?: UsedContext[];
  planningPhase?: PlanningPhase;
  agentMode?: boolean;
}

export interface ParsedSession {
  id?: string;
  title?: string;
  createdAt?: number;
  messages: ParsedMessage[];
  model?: string;
  totalMessages: number;
  exportedAt?: number;
}

// Raw format types for the various GitHub Copilot export schemas

export interface RawToolCallV1 {
  kind?: 'toolCall';
  name?: string;
  toolCallId?: string;
  input?: Record<string, unknown> | string;
  result?: {
    content?: Array<{ text?: string } | string>;
    isError?: boolean;
  };
}

export interface RawToolCallV2 {
  id?: string;
  type?: 'function';
  function?: {
    name: string;
    arguments: string;
  };
}

export interface RawResponseValue {
  kind?: 'markdownContent' | 'toolCall' | 'codeblockUri' | 'inlineReference';
  value?: string | RawToolCallV1 | RawResponseValue;
  content?: string;
}

export interface RawRequestV1 {
  message?: {
    text?: string;
    timestamp?: string | number;
    parts?: Array<{ text?: string }>;
  };
  response?: {
    text?: string;
    timestamp?: string | number;
    value?: RawResponseValue[];
    agent?: string;
    model?: string;
    timeTaken?: number;
    result?: {
      timings?: { firstProgress?: number; totalElapsed?: number };
    };
  };
  usedContext?: Array<{
    document?: { uri?: { path?: string }; fileName?: string };
    ranges?: Array<{ startLine?: number; endLine?: number }>;
  }>;
}

export interface RawSessionV1 {
  requests?: RawRequestV1[];
  creationDate?: string | number;
  title?: string;
  sessionId?: string;
  model?: string;
}

export interface RawMessageV2 {
  role?: 'user' | 'assistant' | 'system';
  content?: string | Array<{ type?: string; text?: string }>;
  timestamp?: string | number;
  tool_calls?: RawToolCallV2[];
  tool_call_id?: string;
  name?: string;
}

export interface RawSessionV2 {
  messages?: RawMessageV2[];
  id?: string;
  title?: string;
  created_at?: string | number;
  model?: string;
}

export type RawChatExport = RawSessionV1 | RawSessionV2 | RawRequestV1[] | RawMessageV2[];
