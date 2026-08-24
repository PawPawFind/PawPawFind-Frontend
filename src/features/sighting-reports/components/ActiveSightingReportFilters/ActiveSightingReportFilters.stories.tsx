import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActiveSightingReportFilters } from './ActiveSightingReportFilters'
const meta = {
  title: 'Features/Reports/ActiveSightingReportFilters',
  component: ActiveSightingReportFilters,
  tags: ['autodocs'],
  args: {
    filters: [
      { value: 'dog', label: '강아지' },
      { value: 'medium', label: '중형' },
    ],
    onRemove: () => undefined,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActiveSightingReportFilters>
export default meta
type Story = StoryObj<typeof meta>
export const Default = {} satisfies Story
export const Empty = { args: { filters: [] } } satisfies Story
export const LongLabelNarrowWidth = {
  args: { filters: [{ value: 'harness', label: '빨간색 하네스를 착용하고 있어요' }] },
  decorators: [
    (Story) => (
      <div style={{ width: 220 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Story
