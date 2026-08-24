export interface ShelterNoticeDetail {
  id: string
  title: string
  status: string
  photos: string[]
  details: { label: string; value: string }[]
  shelterName: string
  shelterAddress: string
  shelterPhone: string
}
