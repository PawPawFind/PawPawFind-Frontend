import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportLocationPicker, type ReportLocationValue } from './ReportLocationPicker'

function LocationPickerExample() {
  const [value, setValue] = useState<ReportLocationValue>({
    happenPlace: '',
    latitude: '',
    longitude: '',
  })

  return (
    <ReportLocationPicker
      appKey=""
      description="지도를 움직여 핀을 맞추면 그 지점이 저장돼요."
      heading="발견 장소"
      onValueChange={setValue}
      value={value}
    />
  )
}

const meta = {
  title: 'Features/ReportLocation/ReportLocationPicker',
  component: ReportLocationPicker,
  tags: ['autodocs'],
  args: {
    appKey: '',
    description: '지도를 움직여 핀을 맞추면 그 지점이 저장돼요.',
    heading: '발견 장소',
    onValueChange: () => undefined,
    value: { happenPlace: '', latitude: '', longitude: '' },
  },
  decorators: [
    (Story) => (
      <div className="sb-preview-width-control">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReportLocationPicker>

export default meta
type Story = StoryObj<typeof meta>

export const MissingKeyFallback = {
  render: () => <LocationPickerExample />,
} satisfies Story

export const SelectedLocation = {
  args: {
    value: {
      happenPlace: '서울 마포구 동교로 27길 14',
      latitude: '37.5631234',
      longitude: '126.9256789',
    },
  },
} satisfies Story
