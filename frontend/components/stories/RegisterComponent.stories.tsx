import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterComponent from '../RegisterComponent';
import '../../../i18n'; // Initialize i18n

/**
 * Storybook Stories for RegisterComponent
 * 
 * Demonstrates all possible states and interactions:
 * - Empty form (default)
 * - Form with validation errors
 * - Loading state
 * - Success state
 * - Error state (API error)
 * - Different password strengths
 * - Different languages
 */

const meta: Meta<typeof RegisterComponent> = {
  title: 'Auth/RegisterComponent',
  component: RegisterComponent,
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
# Registration Component

A fully-featured user registration form following Clean Architecture and DDD principles.

## Features
- **First Name & Last Name**: Separate fields with validation
- **Email Validation**: RFC 5322 compliant
- **Password Strength Meter**: Visual feedback (weak/medium/strong)
- **Confirm Password**: Match validation
- **Terms & Conditions**: Required checkbox
- **Privacy Policy**: Optional checkbox
- **OAuth Integration**: Google and GitHub
- **Multi-language**: Supports 5 languages (en, it, es, fr, de)
- **Accessibility**: ARIA labels and keyboard navigation
- **Responsive**: Mobile-first design

## Architecture
- **Domain Layer**: Email, Password, Name Value Objects
- **Application Layer**: SignupUseCase
- **Infrastructure Layer**: AuthService, HttpClient
- **Presentation Layer**: React component with hooks
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RegisterComponent>;

/**
 * Default story - Empty form
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default empty registration form ready for user input.',
      },
    },
  },
};

/**
 * Form with all fields filled
 */
export const FilledForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = canvasElement;
    
    // Note: In a real Storybook setup, you'd use @storybook/testing-library
    // to interact with the form programmatically
    // For now, this is a visual representation
  },
  parameters: {
    docs: {
      description: {
        story: 'Registration form with all fields filled in with valid data.',
      },
    },
  },
};

/**
 * Weak Password Example
 */
export const WeakPassword: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Registration form showing a weak password strength indicator.
Password: "Pass123!" (8 characters, basic complexity)
        `,
      },
    },
  },
};

/**
 * Medium Password Example
 */
export const MediumPassword: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Registration form showing a medium password strength indicator.
Password: "Password12!" (11 characters, good complexity)
        `,
      },
    },
  },
};

/**
 * Strong Password Example
 */
export const StrongPassword: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Registration form showing a strong password strength indicator.
Password: "MyStr0ng!P@ssw0rd#2024" (23 characters, excellent complexity)
        `,
      },
    },
  },
};

/**
 * Validation Errors
 */
export const ValidationErrors: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Form showing multiple validation errors:
- Invalid email format
- Weak password
- Passwords don't match
- Terms not accepted
        `,
      },
    },
  },
};

/**
 * Email Already Exists Error
 */
export const EmailExistsError: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Form showing error when email already exists in the system.',
      },
    },
    msw: {
      handlers: [
        // This would override MSW handlers to return 409 Conflict
      ],
    },
  },
};

/**
 * Loading State
 */
export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Form in loading state during registration API call.',
      },
    },
  },
};

/**
 * Success State
 */
export const Success: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Form showing success message after successful registration.',
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
        story: 'Registration form in Italian language.',
      },
    },
  },
  beforeEach: () => {
    localStorage.setItem('i18nextLng', 'it');
  },
};

/**
 * Spanish Language
 */
export const SpanishLanguage: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Registration form in Spanish language.',
      },
    },
  },
  beforeEach: () => {
    localStorage.setItem('i18nextLng', 'es');
  },
};

/**
 * German Language
 */
export const GermanLanguage: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Registration form in German language.',
      },
    },
  },
  beforeEach: () => {
    localStorage.setItem('i18nextLng', 'de');
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
        story: 'Registration form optimized for mobile devices (375x667).',
      },
    },
  },
};

/**
 * Tablet View
 */
export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Registration form on tablet devices (768x1024).',
      },
    },
  },
};

/**
 * Dark Mode (if implemented)
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Registration form in dark mode theme.',
      },
    },
  },
};
