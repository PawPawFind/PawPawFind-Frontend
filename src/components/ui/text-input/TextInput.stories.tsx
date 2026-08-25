import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextInput } from './TextInput'

const meta = {
  title: 'UI/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  args: { label: '제보 제목', placeholder: '제목을 입력해 주세요' },
  decorators: [
    (Story) => (
      <div className="sb-preview-width-control">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {} satisfies Story
export const Filled = { args: { defaultValue: '연남동 갈색 강아지를 목격했어요' } } satisfies Story
export const Disabled = {
  args: { disabled: true, defaultValue: '수정할 수 없는 닉네임' },
} satisfies Story
export const Invalid = {
  args: { errorMessage: '제보 제목을 입력해 주세요.', required: true },
} satisfies Story
export const HelpText = {
  args: { description: '목격한 동물을 알아보기 쉽게 적어 주세요.' },
} satisfies Story
export const LongLabel = {
  args: { label: '다른 사용자가 목록에서 동물을 알아볼 수 있도록 자세한 제목을 입력해 주세요' },
  decorators: [
    (Story) => (
      <div className="sb-preview-width-narrow">
        <Story />
      </div>
    ),
  ],
} satisfies Story
