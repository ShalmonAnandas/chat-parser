// ── Parsed types (what the UI consumes) ──────────────────────────────

export type ToolCategory =
  | 'file-read'
  | 'file-write'
  | 'file-search'
  | 'terminal'
  | 'search'
  | 'subagent'
  | 'other';

export interface ToolCall {
  id?: string;
  name: string;
  toolId?: string;
  category: ToolCategory;
  arguments?: Record<string, unknown> | string;
  result?: unknown;
  isError?: boolean;
  /** Human-readable description (e.g. "Read SKILL.md") */
  description?: string;
  /** Past-tense description (e.g. "Read SKILL.md") */
  pastTenseDescription?: string;
}

export interface ThinkingBlock {
  id?: string;
  content: string;
}

export interface TextEdit {
  uri: string;
  fileName: string;
  editCount: number;
  done: boolean;
}

export interface InlineReference {
  name: string;
  path: string;
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
  thinkingBlocks?: ThinkingBlock[];
  textEdits?: TextEdit[];
  inlineReferences?: InlineReference[];
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

// ── Raw format types for various GitHub Copilot export schemas ───────

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
  kind?: string;
  value?: unknown;
  content?: string;
  // toolInvocationSerialized fields
  invocationMessage?: { value?: string };
  pastTenseMessage?: { value?: string };
  isComplete?: boolean;
  isConfirmed?: { type?: number };
  toolCallId?: string;
  toolId?: string;
  source?: { type?: string; label?: string };
  generatedTitle?: string;
  isAttachedToThinking?: boolean;
  // textEditGroup fields
  uri?: { path?: string; fsPath?: string };
  edits?: unknown[];
  done?: boolean;
  // inlineReference fields
  name?: string;
  inlineReference?: { path?: string; fsPath?: string };
  // thinking fields
  id?: string;
  // confirmation fields
  title?: string;
  message?: { value?: string };
  // questionCarousel fields
  questions?: Array<{
    id?: string;
    type?: string;
    title?: string;
    message?: string;
    options?: Array<{ label?: string; value?: string }>;
    defaultValue?: string;
  }>;
}

export interface RawRequestV1 {
  requestId?: string;
  message?: {
    text?: string;
    timestamp?: string | number;
    parts?: Array<{ text?: string; kind?: string }>;
  };
  response?: {
    text?: string;
    timestamp?: string | number;
    value?: RawResponseValue[];
    agent?: string | { id?: string; name?: string };
    model?: string;
    timeTaken?: number;
    result?: {
      timings?: { firstProgress?: number; totalElapsed?: number };
    };
  };
  // New format fields
  timestamp?: string | number;
  modelId?: string;
  result?: {
    timings?: { firstProgress?: number; totalElapsed?: number };
  };
  agent?: { id?: string; name?: string };
  modeInfo?: { kind?: string; modeName?: string };
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
  responderUsername?: string;
  initialLocation?: string;
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
