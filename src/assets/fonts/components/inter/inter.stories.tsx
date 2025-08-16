import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';

import {inter} from './inter';

const meta: Meta<typeof inter> = {
  component: inter,
};

export default meta;

type Story = StoryObj<typeof inter>;

export const Basic: Story = {args: {}};
