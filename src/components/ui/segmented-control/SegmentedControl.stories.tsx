import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SegmentedControl } from './SegmentedControl'

const options = [
  { value: 'dog', label: '강아지' },
  { value: 'cat', label: '고양이' },
] as const

function SegmentedControlExample() {
  const [value, setValue] = useState('dog')
  return (
    <SegmentedControl
      ariaLabel="동물 종류"
      onValueChange={setValue}
      options={options}
      value={value}
    />
  )
}

const meta = {
  title: 'UI/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  args: {
    ariaLabel: '동물 종류',
    onValueChange: () => undefined,
    options,
    value: 'dog',
  },
  decorators: [
    (Story) => (
      <div className="sb-preview-width-control">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  render: () => <SegmentedControlExample />,
} satisfies Story

export const Disabled = {
  args: { disabled: true },
} satisfies Story

export const LongLabelsNarrowWidth = {
  args: {
    ariaLabel: '설명 길이 선택',
    onValueChange: () => undefined,
    options: [
      { value: 'short', label: '짧고 간단한 설명' },
      { value: 'long', label: '조금 더 자세하고 긴 설명' },
    ],
    value: 'short',
  },
  decorators: [
    (Story) => (
      <div className="sb-preview-width-narrow">
        <Story />
      </div>
    ),
  ],
} satisfies Story
