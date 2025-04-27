import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Feedback } from './Feedback';

const meta: Meta<typeof Feedback> = {
  title: 'UI/Feedback',
  component: Feedback,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: action('onSubmit'),
  },
}; 