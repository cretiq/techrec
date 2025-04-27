import type { Meta, StoryObj } from '@storybook/react';
import { ProgressIndicator } from './ProgressIndicator';

const meta: Meta<typeof ProgressIndicator> = {
  title: 'UI/ProgressIndicator',
  component: ProgressIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    type: { control: 'radio', options: ['bar', 'circle'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Bar: Story = {
  args: {
    type: 'bar',
    value: 50,
  },
};

export const CirclePlaceholder: Story = {
  args: {
    type: 'circle',
    value: 75,
  },
}; 