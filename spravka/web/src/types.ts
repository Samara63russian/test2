export interface User {
  id: number;
  username: string;
  full_name: string;
  role: "admin" | "user";
  is_active: boolean;
  created_at: string;
}

export interface Institution {
  id: number;
  name: string;
  code: string;
  address: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface AnswerOption {
  id: number;
  question_id: number;
  text: string;
  sort_order: number;
}

export interface Question {
  id: number;
  text: string;
  question_type: "text" | "single" | "multi" | "number" | "date" | "yesno";
  sort_order: number;
  required: boolean;
  is_active: boolean;
  help_text: string;
  created_at: string;
  options: AnswerOption[];
}

export interface Answer {
  id?: number;
  question_id: number;
  value_text: string;
  option_ids: number[];
}

export interface Report {
  id: number;
  institution_id: number;
  institution_name: string;
  author_id: number | null;
  author_name: string;
  report_date: string;
  status: "draft" | "submitted";
  notes: string;
  client_uuid: string | null;
  created_at: string;
  updated_at: string;
  answers: Answer[];
}

export interface AnalyticsSummary {
  total_reports: number;
  submitted_reports: number;
  draft_reports: number;
  institutions_count: number;
  questions_count: number;
  by_institution: { name: string; count: number }[];
  by_month: { month: string; count: number }[];
  recent_reports: Report[];
}

export interface OfflineDraft {
  client_uuid: string;
  institution_id: number;
  report_date: string;
  notes: string;
  status: "draft" | "submitted";
  answers: Answer[];
  saved_at: string;
  synced: boolean;
}
