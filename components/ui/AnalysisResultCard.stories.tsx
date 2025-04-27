import type { Meta, StoryObj } from '@storybook/react';
import { AnalysisResultCard } from './AnalysisResultCard';

const meta: Meta<typeof AnalysisResultCard> = {
  title: 'UI/AnalysisResultCard',
  component: AnalysisResultCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Analysis Section Title',
    children: <p>This is the content of the analysis section.</p>,
  },
};

export const WithoutChildren: Story = {
  args: {
    title: 'Empty Section',
  },
}; 