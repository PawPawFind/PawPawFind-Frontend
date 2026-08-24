import type { Meta, StoryObj } from '@storybook/react-vite'
import { MissingAnimalSearchFormPage } from './MissingAnimalSearchFormPage'

const meta = {
  title: 'Features/MissingAnimalSearch/MissingAnimalSearchFormPage',
  component: MissingAnimalSearchFormPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { onSubmit: () => undefined },
} satisfies Meta<typeof MissingAnimalSearchFormPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {} satisfies Story
