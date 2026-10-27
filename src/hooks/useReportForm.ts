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
  initialSize?: AnimalSize | null
  initialSpecies?: Species | null
}

interface ToggleFeatureOptions {
  category: ReportFeatureCategory
  keyword: string
  maxSelections: number | null
  selection: 'single' | 'multiple'
}

export function useReportForm({
  initialEventDate = '',
  initialSize = null,
  initialSpecies = null,
}: UseReportFormOptions = {}) {
  const [species, setSpecies] = useState<Species | null>(initialSpecies)
  const [size, setSize] = useState<AnimalSize | null>(initialSize)
  const [eventDate, setEventDate] = useState(initialEventDate)
  const [eventHour, setEventHour] = useState('')
  const [happenPlace, setHappenPlace] = useState('')
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
  const hasValidHour =
    eventHour !== '' &&
    Number.isInteger(Number(eventHour)) &&
    Number(eventHour) >= 0 &&
    Number(eventHour) <= 23
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
    hasValidHour &&
    hasValidLatitude &&
    hasValidLongitude

  const getRequestFields = (): ReportRequestFields => {
    if (!species) throw new Error('동물 종류를 선택해 주세요.')

    return {
      species,
      size,
      eventDate,
      eventHour: Number(eventHour),
      happenPlace: happenPlace.trim(),
      latitude: parsedLatitude,
      longitude: parsedLongitude,
    }
  }

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
    setFeatures,
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
