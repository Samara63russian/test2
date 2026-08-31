export interface User {
  id: number
  username: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

export interface Institution {
  id: number
  name: string
  address: string
  contact: string
  is_active: boolean
  created_at: string
}

export interface QuestionOption {
  id: number
  text: string
  sort_order: number
}

export interface Question {
  id: number
  text: string
  question_type: string
  category: string
  sort_order: number
  is_required: boolean
  is_active: boolean
  options: QuestionOption[]
}

export interface ReferenceItem {
  id: number
  category: string
  title: string
  content: string
  sort_order: number
  created_at: string
}

export interface ReportAnswer {
  id?: number
  question_id: number
  answer_text: string
}

export interface Report {
  id: number
  institution_id: number
  author_id: number
  report_date: string
  status: string
  notes: string
  client_uuid: string | null
  created_at: string
  updated_at: string
  answers: ReportAnswer[]
  institution_name?: string
  author_name?: string
}

export interface AnalyticsSummary {
  total_reports: number
  reports_by_institution: { name: string; count: number }[]
  reports_by_month: { month: string; count: number }[]
  reports_by_status: { status: string; count: number }[]
  recent_reports: Report[]
}

export interface OfflineReport {
  client_uuid: string
  institution_id: number
  report_date: string
  status: string
  notes: string
  answers: ReportAnswer[]
  synced: boolean
  created_at: string
}
