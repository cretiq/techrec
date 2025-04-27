import type { Meta, StoryObj } from '@storybook/react';
import { Navigation } from './Navigation';

const meta: Meta<typeof Navigation> = {
  title: 'UI/Navigation',
  component: Navigation,
  parameters: {
    layout: 'padded', // Use padded layout for navigation elements
  },
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'radio', options: ['tabs', 'breadcrumbs', 'section-links'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TabsPlaceholder: Story = {
  args: {
    type: 'tabs',
  },
};

export const BreadcrumbsPlaceholder: Story = {
  args: {
    type: 'breadcrumbs',
  },
};

export const SectionLinksPlaceholder: Story = {
  args: {
    type: 'section-links',
  },
}; 