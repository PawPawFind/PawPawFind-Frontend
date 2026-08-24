export interface SightingReportListItem {
  id: string
  title: string
  speciesLabel: string
  colorText: string
  sizeLabel: string
  areaText: string
  dateText: string
  thumbnailUrl?: string
}

export interface SightingReportListResponse {
  items: SightingReportListItem[]
  page: { number: number; size: number; totalCount: number; totalPages: number }
}

export interface ReportListApiItem {
  reportId: number
  thumbnailUrl: string | null
  userId: number | null
  reportType: string
  title: string | null
  species: string
  size: string
  eventDate: string
  eventHour: number | null
  happenPlace: string
  latitude: number
  longitude: number
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface ReportPhotoApiItem {
  id: number
  reportId: number
  photoUrl: string
  createdAt: string
  updatedAt: string
  sortOrder: number
}

export interface ReportFeatureApiItem {
  id: number
  reportId: number
  category: string
  keyword: string
}

interface ReportPageSort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface ReportListApiResponse {
  totalPages: number
  totalElements: number
  size: number
  content: ReportListApiItem[]
  number: number
  sort: ReportPageSort
  pageable: {
    offset: number
    sort: ReportPageSort
    paged: boolean
    pageNumber: number
    pageSize: number
    unpaged: boolean
  }
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface SightingReportDetail extends SightingReportListItem {
  timeBandText: string
  features: { category: string; keywords: string[] }[]
  photos: { id: string; url: string; alt: string }[]
  location: {
    lat: number
    lng: number
    radiusM: number
  }
  predictedRoute: {
    id: string
    areaText: string
    dateTimeText: string
    description: string
    kind: 'reported' | 'matched' | 'predicted'
  }[]
}
