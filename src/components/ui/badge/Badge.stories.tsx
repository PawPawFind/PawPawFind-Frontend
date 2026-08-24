import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: '목격 제보',
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {} satisfies Story

export const LongLabel = {
  args: {
    children: '보호소에서 보호 중',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 140 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Story
