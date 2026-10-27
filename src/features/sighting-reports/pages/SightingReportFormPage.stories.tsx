import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'
import { SightingReportFormPage } from './SightingReportFormPage'

const meta = {
  title: 'Features/SightingReports/SightingReportFormPage',
  component: SightingReportFormPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { onSubmit: () => undefined },
} satisfies Meta<typeof SightingReportFormPage>

export default meta
type Story = StoryObj<typeof meta>

export const StepOne = {} satisfies Story

export const StepTwo = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.upload(
      canvas.getByLabelText('목격 제보 사진 선택'),
      new File(['sighting-photo'], 'sighting-story.jpg', { type: 'image/jpeg' }),
    )
    await userEvent.click(canvas.getByRole('button', { name: '장소명 입력 열기' }))
    await userEvent.type(canvas.getByRole('textbox', { name: /장소명 또는 주소/ }), '연남동')
    await userEvent.click(canvas.getByRole('button', { name: /발견 시간대/ }))
    await userEvent.click(canvas.getByRole('option', { name: '14–16시' }))
    await userEvent.click(canvas.getByRole('button', { name: '다음' }))
    await canvas.findByRole('heading', { name: '사진을 보고 특징을 채웠어요' })
  },
} satisfies Story
