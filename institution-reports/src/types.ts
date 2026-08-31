export type Role = 'admin' | 'editor' | 'viewer'
export type QuestionType = 'text' | 'textarea' | 'number' | 'select' | 'boolean'
export type ReportStatus = 'draft' | 'submitted'

export type User = {
  id: string
  username: string
  fullName: string
  role: Role
  institutionId: string | null
  active?: boolean
}

export type Institution = {
  id: string
  name: string
  shortName: string
  address: string
  active: boolean
}

export type Question = {
  id: string
  text: string
  helpText: string
  type: QuestionType
  options: string[]
  category: string
  required: boolean
  position: number
  active: boolean
}

export type ReportListItem = {
  id: string
  clientId: string | null
  institutionId: string
  institutionName: string
  institutionShortName: string
  reportDate: string
  status: ReportStatus
  comment: string
  authorName: string
  answerCount: number
  questionCount: number
  createdAt: string
  updatedAt: string
  pending?: boolean
}

export type ReportPayload = {
  clientId?: string
  institutionId: string
  reportDate: string
  status: ReportStatus
  comment: string
  answers: Record<string, string | number | boolean | null>
}

export type ReportDetails = ReportPayload & {
  id: string
  clientId: string | null
}

export type BootstrapData = {
  institutions: Institution[]
  questions: Question[]
  users: User[]
}

export type AnalyticsData = {
  byInstitution: Array<{ name: string; reports: number; submitted: number }>
  byMonth: Array<{ month: string; reports: number }>
  statusAnswers: Array<{ name: string; value: number }>
}
