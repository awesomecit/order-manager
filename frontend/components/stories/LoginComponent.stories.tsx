import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import LoginComponent from '../login-component';
import '../../../i18n'; // Initialize i18n

/**
 * Storybook Stories for LoginComponent
 * 
 * Demonstrates all possible states and interactions
 */

const meta: Meta<typeof LoginComponent> = {
  title: 'Auth/LoginComponent',
  component: LoginComponent,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Login Component

A fully-featured login/signup toggle form following Clean Architecture and DDD principles.

## Features
- **Toggle Mode**: Switch between Login and Sign Up
- **Email & Password**: Validated inputs
- **Remember Me**: Persist session
- **OAuth**: Google and GitHub integration
- **Multi-language**: 5 languages supported
- **Accessibility**: Full ARIA support
- **Responsive**: Mobile-first design
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoginComponent>;

/**
 * Login Mode (Default)
 */
export const LoginMode: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default login form for existing users.',
      },
    },
  },
};

/**
 * Login with Credentials Test
 * Email: admin@example.com
 * Password: Admin123!
 */
export const LoginWithCredentials: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Login form pre-filled with test credentials:
- Email: admin@example.com
- Password: Admin123!
        `,
      },
    },
  },
};

/**
 * Sign Up Mode
 */
export const SignUpMode: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Registration form for new users.',
      },
    },
  },
};

/**
 * Loading State
 */
export const LoadingState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Form in loading state during authentication.',
      },
    },
  },
};

/**
 * Invalid Credentials Error
 */
export const InvalidCredentials: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Login form showing invalid credentials error message.',
      },
    },
  },
};

/**
 * Italian Language
 */
export const ItalianLanguage: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Login form in Italian language.',
      },
    },
  },
  beforeEach: () => {
    localStorage.setItem('i18nextLng', 'it');
  },
};

/**
 * Mobile View
 */
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Login form optimized for mobile devices.',
      },
    },
  },
};
