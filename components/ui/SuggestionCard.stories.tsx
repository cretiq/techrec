import type { Meta, StoryObj } from '@storybook/react';
import { SuggestionCard } from './SuggestionCard';

const meta: Meta<typeof SuggestionCard> = {
  title: 'UI/SuggestionCard',
  component: SuggestionCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Improve Section X',
    description: 'A brief description of the suggestion.',
  },
}; 