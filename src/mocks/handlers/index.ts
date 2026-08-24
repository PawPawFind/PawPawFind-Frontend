import { authHandlers } from './auth'
import { missingAnimalSearchHandlers } from './missingAnimalSearch'
import { sightingReportsHandlers } from './sightingReports'

export const handlers = [
  ...authHandlers,
  ...missingAnimalSearchHandlers,
  ...sightingReportsHandlers,
]
