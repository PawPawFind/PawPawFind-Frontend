import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'
import { TimeBandSelect } from './TimeBandSelect'

const options = [
  { value: '', label: '시간을 잘 모르겠어요' },
  { value: '1', label: '00–02시' },
  { value: '3', label: '02–04시' },
  { value: '5', label: '04–06시' },
  { value: '7', label: '06–08시' },
  { value: '9', label: '08–10시' },
  { value: '11', label: '10–12시' },
  { value: '13', label: '12–14시' },
  { value: '15', label: '14–16시' },
  { value: '17', label: '16–18시' },
  { value: '19', label: '18–20시' },
  { value: '21', label: '20–22시' },
  { value: '23', label: '22–24시' },
] as const

function TimeBandSelectExample() {
  const [value, setValue] = useState<(typeof options)[number]['value']>('15')

  return (
    <TimeBandSelect
      description="정확한 시각이 아니어도 괜찮아요."
      label="발견 시간대"
      onValueChange={setValue}
      options={options}
      value={value}
    />
  )
}

const meta = {
  title: 'UI/TimeBandSelect',
  component: TimeBandSelect,
  tags: ['autodocs'],
  args: {
    description: '정확한 시각이 아니어도 괜찮아요.',
    label: '발견 시간대',
    onValueChange: () => undefined,
    options,
    value: '15',
  },
  decorators: [
    (Story) => (
      <div className="sb-preview-width-control" style={{ minHeight: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimeBandSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  render: () => <TimeBandSelectExample />,
} satisfies Story

export const Open = {
  render: () => <TimeBandSelectExample />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: '발견 시간대 14–16시' }),
    )
  },
} satisfies Story

export const Disabled = {
  args: { disabled: true },
} satisfies Story

export const LongTextNarrowWidth = {
  args: {
    description: '정확한 시각이 기억나지 않아도 가장 가까운 시간대를 선택할 수 있어요.',
    label: '동물을 마지막으로 본 시간대',
    options: [
      { value: '', label: '시간을 전혀 기억하지 못해요' },
      { value: '15', label: '오후 2시부터 4시 사이인 것 같아요' },
    ],
    value: '',
  },
  decorators: [
    (Story) => (
      <div className="sb-preview-width-narrow">
        <Story />
      </div>
    ),
  ],
} satisfies Story
