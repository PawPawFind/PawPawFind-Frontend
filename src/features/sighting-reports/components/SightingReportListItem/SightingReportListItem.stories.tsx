import type { Meta, StoryObj } from '@storybook/react-vite'
import { SightingReportListItem } from './SightingReportListItem'

const meta = {
  title: 'Features/Reports/SightingReportListItem',
  component: SightingReportListItem,
  tags: ['autodocs'],
  args: {
    report: {
      id: 'p1',
      title: '믹스견 · 갈색 · 중형',
      speciesLabel: '강아지',
      areaText: '서울 마포구 연남동 · 0.9km',
      dateText: '2026.08.11',
      tags: ['목줄 있음', '털 길이 김', '귀 접힘'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 520, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SightingReportListItem>
export default meta
type Story = StoryObj<typeof meta>
export const Default = {} satisfies Story
export const Interactive = { args: { onSelect: () => undefined } } satisfies Story
export const LongContentNarrowWidth = {
  args: {
    report: {
      id: 'p2',
      title: '아주 긴 제목에서도 목격한 동물의 중요한 정보가 잘리지 않고 자연스럽게 표시됩니다',
      speciesLabel: '고양이',
      areaText: '서울특별시 마포구 아주 긴 도로명 주소 인근 · 12.4km',
      dateText: '2026.08.10',
      tags: ['빨간색 하네스를 착용하고 있음'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Story
