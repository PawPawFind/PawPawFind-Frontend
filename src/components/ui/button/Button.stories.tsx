import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: '다시 시도',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['medium', 'large'],
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary = {} satisfies Story

export const Secondary = {
  args: {
    variant: 'secondary',
  },
} satisfies Story

export const Large = {
  args: {
    children: '제보 등록하기',
    size: 'large',
  },
} satisfies Story

export const Disabled = {
  args: {
    children: '사진 1장부터 시작할 수 있어요',
    disabled: true,
    size: 'large',
  },
} satisfies Story

export const LongLabel = {
  args: {
    children: '등록한 사진과 정보를 바탕으로 비슷한 동물 찾아보기',
    size: 'large',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Story
