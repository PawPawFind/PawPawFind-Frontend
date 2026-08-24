import { useState } from 'react'
import type { AnimalSize, Species } from '@/types/domain'
import {
  DEFAULT_REPORT_LOCATION,
  type ReportFeatureCategory,
  type ReportFeatureInput,
  type ReportRequestFields,
} from '@/types/report'

interface UseReportFormOptions {
  initialEventDate?: string
  initialSize: AnimalSize
}

interface ToggleFeatureOptions {
  category: ReportFeatureCategory
  keyword: string
  maxSelections: number | null
  selection: 'single' | 'multiple'
}

export function useReportForm({ initialEventDate = '', initialSize }: UseReportFormOptions) {
  const [species, setSpecies] = useState<Species>('DOG')
  const [size, setSize] = useState<AnimalSize>(initialSize)
  const [eventDate, setEventDate] = useState(initialEventDate)
  const [eventHour, setEventHour] = useState('')
  const [happenPlace, setHappenPlace] = useState<string>(DEFAULT_REPORT_LOCATION.happenPlace)
  const [latitude, setLatitude] = useState<string>(DEFAULT_REPORT_LOCATION.latitude)
  const [longitude, setLongitude] = useState<string>(DEFAULT_REPORT_LOCATION.longitude)
  const [features, setFeatures] = useState<ReportFeatureInput[]>([])

  const toggleFeature = ({ category, keyword, maxSelections, selection }: ToggleFeatureOptions) => {
    setFeatures((current) => {
      const isSelected = current.some(
        (feature) => feature.category === category && feature.keyword === keyword,
      )

      if (isSelected) {
        return current.filter(
          (feature) => feature.category !== category || feature.keyword !== keyword,
        )
      }

      const categorySelectionCount = current.filter(
        (feature) => feature.category === category,
      ).length

      if (
        selection === 'multiple' &&
        maxSelections !== null &&
        categorySelectionCount >= maxSelections
      ) {
        const oldestSelectionIndex = current.findIndex((feature) => feature.category === category)
        const next = current.filter((_, index) => index !== oldestSelectionIndex)

        return [...next, { category, keyword }]
      }

      const next =
        selection === 'single'
          ? current.filter((feature) => feature.category !== category)
          : current

      return [...next, { category, keyword }]
    })
  }

  const isFeatureSelected = (category: ReportFeatureCategory, keyword: string) =>
    features.some((feature) => feature.category === category && feature.keyword === keyword)

  const parsedLatitude = Number(latitude)
  const parsedLongitude = Number(longitude)
  const hasRequiredColor = features.some((feature) => feature.category === '털색')
  const hasValidHour =
    eventHour === '' ||
    (Number.isInteger(Number(eventHour)) && Number(eventHour) >= 0 && Number(eventHour) <= 23)
  const hasValidLatitude =
    latitude !== '' &&
    Number.isFinite(parsedLatitude) &&
    parsedLatitude >= -90 &&
    parsedLatitude <= 90
  const hasValidLongitude =
    longitude !== '' &&
    Number.isFinite(parsedLongitude) &&
    parsedLongitude >= -180 &&
    parsedLongitude <= 180

  const isComplete =
    eventDate !== '' &&
    happenPlace.trim() !== '' &&
    hasRequiredColor &&
    hasValidHour &&
    hasValidLatitude &&
    hasValidLongitude

  const getRequestFields = (): ReportRequestFields => ({
    species,
    size,
    eventDate,
    eventHour: eventHour === '' ? null : Number(eventHour),
    happenPlace: happenPlace.trim(),
    latitude: parsedLatitude,
    longitude: parsedLongitude,
  })

  return {
    eventDate,
    eventHour,
    features,
    getRequestFields,
    happenPlace,
    isComplete,
    isFeatureSelected,
    latitude,
    longitude,
    setEventDate,
    setEventHour,
    setHappenPlace,
    setLatitude,
    setLongitude,
    setSize,
    setSpecies,
    size,
    species,
    toggleFeature,
  }
}
