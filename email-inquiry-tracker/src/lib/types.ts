export type InquiryType = "kp" | "price_list" | "inquiry" | "other";

export type InquiryStatus = "new" | "in_progress" | "quoted" | "closed";

export interface EmailInput {
  from: string;
  subject: string;
  body: string;
  receivedAt?: string;
}

export interface AnalysisResult {
  type: InquiryType;
  summary: string;
  company: string;
  contactName: string;
  contactEmail: string;
  products: string[];
  urgency: "low" | "medium" | "high";
  suggestedAction: string;
  aiProvider: "groq" | "local";
}

export interface InquiryRecord extends AnalysisResult {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  createdAt: string;
  status: InquiryStatus;
  notes: string;
}

export const TYPE_LABELS: Record<InquiryType, string> = {
  kp: "Запрос КП",
  price_list: "Запрос перечня / прайса",
  inquiry: "Общий запрос",
  other: "Другое",
};

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "Новое",
  in_progress: "В работе",
  quoted: "КП отправлено",
  closed: "Закрыто",
};

export const URGENCY_LABELS: Record<AnalysisResult["urgency"], string> = {
  low: "Низкая",
  medium: "Средняя",
  high: "Высокая",
};
