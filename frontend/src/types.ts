export type Role = 'admin' | 'operator' | 'viewer'
export type Page = 'home' | 'form' | 'directory' | 'analytics' | 'settings'
export type AnswerType = 'text' | 'textarea' | 'number' | 'select' | 'boolean'

export interface User {
  id: number
  username: string
  full_name: string
  role: Role
  institution_id: number | null
  institution_name?: string | null
  is_active: boolean
}

export interface Institution {
  id: number
  name: string
  short_name: string
  address: string
  is_active: boolean
}

export interface Question {
  id: number
  text: string
  description: string
  answer_type: AnswerType
  options: string[]
  is_required: boolean
  is_active: boolean
  order_index: number
}

export interface ReportSummary {
  id: number
  institution_id: number
  institution_name: string
  institution_short_name: string
  report_date: string
  status: 'draft' | 'submitted'
  comment: string
  author_name: string
  answer_count: number
  created_at: string
}

export interface ReportDetail extends ReportSummary {
  answers: Record<string, unknown>
  answer_details: Array<{
    question_id: number
    question: string
    answer_type: AnswerType
    value: unknown
  }>
}

export interface ReportPayload {
  institution_id: number
  report_date: string
  status: 'draft' | 'submitted'
  comment: string
  answers: Record<string, unknown>
  client_id?: string
}

export interface KnowledgeArticle {
  id: number
  title: string
  category: string
  content: string
  updated_at: string
}

export interface AnalyticsData {
  summary: {
    total_reports: number
    today_reports: number
    coverage: number
    incidents: number
  }
  daily: Array<{ date: string; reports: number }>
  institutions: Array<{ name: string; reports: number; last_report: string }>
  levels: Array<{ level: string; value: number }>
}

export interface PendingReport extends ReportPayload {
  queued_at: string
}
