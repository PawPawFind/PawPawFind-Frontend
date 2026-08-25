const animalSpeciesLabels: Record<string, string> = {
  DOG: '강아지',
  CAT: '고양이',
  개: '강아지',
}

export function getAnimalSpeciesLabel(species: string | null | undefined) {
  if (!species) return '정보 없음'
  return animalSpeciesLabels[species] ?? species
}
