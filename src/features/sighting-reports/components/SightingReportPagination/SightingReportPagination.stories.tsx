import type { Meta, StoryObj } from '@storybook/react-vite'
import { SightingReportPagination } from './SightingReportPagination'
const meta = {
  title: 'Features/Reports/SightingReportPagination',
  component: SightingReportPagination,
  tags: ['autodocs'],
  args: { currentPage: 1, totalPages: 4, onPageChange: () => undefined },
} satisfies Meta<typeof SightingReportPagination>
export default meta
type Story = StoryObj<typeof meta>
export const Default = {} satisfies Story
export const FirstPage = { args: { currentPage: 0 } } satisfies Story
export const LastPage = { args: { currentPage: 3 } } satisfies Story
export const Disabled = { args: { disabled: true } } satisfies Story
export const NarrowWidth = {
  decorators: [
    (Story) => (
      <div style={{ width: 180 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Story
