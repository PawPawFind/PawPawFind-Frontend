export interface MyReportApiItem {
  reportId: number
  reportType: string
  title: string | null
  species: string
  size: string
  eventDate: string
  happenPlace: string
  status: string
}

export interface MyReportsApiResponse {
  totalPages: number
  totalElements: number
  size: number
  content: MyReportApiItem[]
  number: number
}
