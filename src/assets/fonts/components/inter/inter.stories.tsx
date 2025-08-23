import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';

import {Inter} from './inter';

const meta: Meta<typeof Inter> = {
  component: Inter,
  title: 'components/Inter',
};

export default meta;

type Story = StoryObj<typeof Inter>;

export const Basic: Story = {args: {}};
