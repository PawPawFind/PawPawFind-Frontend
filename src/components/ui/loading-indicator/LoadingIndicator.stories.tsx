import type { Meta, StoryObj } from '@storybook/react-vite'
import { LoadingIndicator } from './LoadingIndicator'

const meta = {
  title: 'UI/LoadingIndicator',
  component: LoadingIndicator,
  tags: ['autodocs'],
  args: { label: '비슷한 동물을 찾고 있습니다.' },
} satisfies Meta<typeof LoadingIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Medium = {} satisfies Story
export const Small = { args: { size: 'small' } } satisfies Story
