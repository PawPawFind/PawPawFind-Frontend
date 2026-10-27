import type { AnimalSize, Species } from '@/types/domain'

interface CreateSightingTitleOptions {
  happenPlace: string
  colors: string[]
  size: AnimalSize | null
  species: Species
}

const sizeLabels: Record<AnimalSize, string> = {
  SMALL: '소형',
  MEDIUM: '중형',
  LARGE: '대형',
}

function getPlaceSummary(happenPlace: string) {
  const tokens = happenPlace.trim().split(/\s+/)
  return (
    [...tokens].reverse().find((token) => /(?:동|가|리|읍|면)$/.test(token)) ??
    tokens[tokens.length - 1] ??
    ''
  )
}

export function hasBatchim(value: string) {
  const characters = Array.from(value.trim())
  const lastCharacter = characters[characters.length - 1]
  if (!lastCharacter) return false

  const code = lastCharacter.charCodeAt(0) - 0xac00
  return code >= 0 && code <= 0xd7a3 - 0xac00 && code % 28 !== 0
}

export function createSightingTitle({
  colors,
  happenPlace,
  size,
  species,
}: CreateSightingTitleOptions) {
  const place = getPlaceSummary(happenPlace)
  const speciesText = species === 'DOG' ? (size ? `${sizeLabels[size]}견` : '강아지') : '고양이'
  const sizedSpeciesText =
    species === 'CAT' && size ? `${sizeLabels[size]} ${speciesText}` : speciesText
  const description = [colors.join('·'), sizedSpeciesText].filter(Boolean).join(' ')
  const particle = hasBatchim(description) ? '을' : '를'

  return `${place ? `${place}에서 ` : ''}${description}${particle} 봤어요`
}
