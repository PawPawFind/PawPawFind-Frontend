// rank 1(최우선)이 가장 진한 색. rank가 팔레트보다 많으면 마지막 색을 재사용.
const PRIORITY_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']

export function priorityColorForRank(rank: number) {
  const index = Math.min(rank - 1, PRIORITY_COLORS.length - 1)
  return PRIORITY_COLORS[Math.max(index, 0)]
}
