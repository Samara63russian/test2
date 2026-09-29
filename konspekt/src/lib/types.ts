export type RequestType = "kp" | "perechen" | "request" | "other";

export type RecordStatus =
  | "new"
  | "in_progress"
  | "quoted"
  | "done"
  | "archived";

export interface EmailInput {
  from: string;
  subject: string;
  body: string;
  receivedAt?: string;
}

export interface RequestRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  type: RequestType;
  status: RecordStatus;
  summary: string;
  keyPoints: string[];
  company?: string;
  deadline?: string;
  itemsMentioned?: string[];
  confidence: number;
  aiProvider: "local" | "groq" | "gemini";
  notes: string;
}

export interface AnalyzeResult {
  type: RequestType;
  summary: string;
  keyPoints: string[];
  company?: string;
  deadline?: string;
  itemsMentioned?: string[];
  confidence: number;
  aiProvider: "local" | "groq" | "gemini";
}

export const TYPE_LABELS: Record<RequestType, string> = {
  kp: "Запрос КП",
  perechen: "Перечень",
  request: "Запрос",
  other: "Прочее",
};

export const STATUS_LABELS: Record<RecordStatus, string> = {
  new: "Новое",
  in_progress: "В работе",
  quoted: "КП отправлено",
  done: "Закрыто",
  archived: "Архив",
};
