import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SightingReportFilterPanel } from './SightingReportFilterPanel'

const groups = [
  {
    key: 'species',
    label: '동물 종류',
    options: [
      { value: 'dog', label: '강아지' },
      { value: 'cat', label: '고양이' },
    ],
  },
  {
    key: 'size',
    label: '크기',
    options: [
      { value: 'small', label: '소형' },
      { value: 'medium', label: '중형' },
      { value: 'large', label: '대형' },
    ],
  },
]

function FilterPanelExample() {
  const [selected, setSelected] = useState<string[]>(['dog'])
  const toggle = (value: string) =>
    setSelected((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  return <SightingReportFilterPanel groups={groups} onToggle={toggle} selectedValues={selected} />
}

const meta = {
  title: 'Features/Reports/SightingReportFilterPanel',
  component: SightingReportFilterPanel,
  tags: ['autodocs'],
  args: { groups, onToggle: () => undefined, selectedValues: ['dog'] },
  decorators: [
    (Story) => (
      <div style={{ width: 560, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SightingReportFilterPanel>
export default meta
type Story = StoryObj<typeof meta>
export const Interactive = { render: () => <FilterPanelExample /> } satisfies Story
export const Disabled = { args: { disabled: true } } satisfies Story
export const LongOptionNarrowWidth = {
  args: {
    groups: [
      {
        key: 'feature',
        label: '특징',
        options: [{ value: 'harness', label: '빨간색 하네스를 착용하고 있어요' }],
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Story
