import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './presentation/hooks/useAuth';

import { LoginUseCase, SignupUseCase, OAuthLoginUseCase } from './application/use-cases';
import { AuthService } from './infrastructure/auth-service';
import { HttpClient } from './infrastructure/http-client';
import { Email, Password, Name } from './domain/value-objects';
import LanguageSelector from './LanguageSelector';

/**
 * RegisterComponent - User Registration Form
 * 
 * SOLID Principles:
 * - Single Responsibility: Handles only registration UI logic
 * - Open/Closed: Extensible through hooks and composition
 * - Liskov Substitution: Implements standard React component contract
 * - Interface Segregation: Uses specific hooks for specific concerns
 * - Dependency Inversion: Depends on abstractions (hooks) not implementations
 * 
 * Clean Architecture:
 * - Presentation Layer component
 * - Uses Application Layer via useAuth hook
 * - Delegates validation to Domain Layer via useFormValidation
 * - Fully internationalized with i18next
 * 
 * Features:
 * - First Name and Last Name fields (separate)
 * - Email with real-time validation
 * - Password with strength meter
 * - Confirm Password with match validation
 * - Accept Terms checkbox (required)
 * - Privacy Policy checkbox (optional)
 * - OAuth integration (Google, GitHub)
 * - Loading states and error messages
 * - Fully responsive design
 * - ARIA accessibility labels
 * - Multi-language support (5 languages)
 */
const RegisterComponent: React.FC = () => {
  const { t } = useTranslation();
  
  // Initialize use cases
  const httpClient = new HttpClient('http://localhost:3000/api');
  const authService = new AuthService(httpClient);
  const loginUseCase = new LoginUseCase(authService);
  const signupUseCase = new SignupUseCase(authService);
  const oauthUseCase = new OAuthLoginUseCase(authService);
  
  const { signup, loginWithOAuth, loading: isLoading, error: authError } = useAuth(loginUseCase, signupUseCase, oauthUseCase);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  // Validation state
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  /**
   * Calculate password strength
   * Uses heuristics for visual feedback
   */
  const calculatePasswordStrength = (pwd: string): 'weak' | 'medium' | 'strong' => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  };

  /**
   * Real-time validation handlers
   */
  const handleFirstNameBlur = () => {
    const result = Name.create(firstName);
    if (result.isFailure) {
      setFirstNameError(result.getError());
    } else {
      setFirstNameError(null);
    }
  };

  const handleLastNameBlur = () => {
    const result = Name.create(lastName);
    if (result.isFailure) {
      setLastNameError(result.getError());
    } else {
      setLastNameError(null);
    }
  };

  const handleEmailBlur = () => {
    const result = Email.create(email);
    if (result.isFailure) {
      setEmailError(result.getError());
    } else {
      setEmailError(null);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      setPasswordStrength(calculatePasswordStrength(value));
    } else {
      setPasswordStrength(null);
    }
  };

  const handlePasswordBlur = () => {
    const result = Password.create(password);
    if (result.isFailure) {
      setPasswordError(result.getError());
    } else {
      setPasswordError(null);
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && confirmPassword !== password) {
      setConfirmPasswordError(t('auth.validation.passwordMismatch'));
    } else {
      setConfirmPasswordError(null);
    }
  };

  /**
   * Form submission handler
   * Validates all fields before calling signup use case
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setFirstNameError(null);
    setLastNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setTermsError(null);

    // Validate all fields
    const firstNameResult = Name.create(firstName);
    const lastNameResult = Name.create(lastName);
    const emailResult = Email.create(email);
    const passwordResult = Password.create(password);

    let hasError = false;

    if (firstNameResult.isFailure) {
      setFirstNameError(firstNameResult.getError());
      hasError = true;
    }

    if (lastNameResult.isFailure) {
      setLastNameError(lastNameResult.getError());
      hasError = true;
    }

    if (emailResult.isFailure) {
      setEmailError(emailResult.getError());
      hasError = true;
    }

    if (passwordResult.isFailure) {
      setPasswordError(passwordResult.getError());
      hasError = true;
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError(t('auth.validation.passwordMismatch'));
      hasError = true;
    }

    if (!acceptTerms) {
      setTermsError(t('auth.validation.termsRequired'));
      hasError = true;
    }

    if (hasError) return;

    // Call signup use case
    // Note: signup expects (name, email, password, confirmPassword, acceptTerms)
    // We concatenate firstName and lastName for the name parameter
    const fullName = `${firstName} ${lastName}`.trim();
    await signup(fullName, email, password, confirmPassword, acceptTerms);
  };

  /**
   * OAuth handler for Google
   */
  const handleGoogleSignup = async () => {
    await loginWithOAuth('google');
  };

  /**
   * OAuth handler for GitHub
   */
  const handleGitHubSignup = async () => {
    await loginWithOAuth('github');
  };

  /**
   * Get password strength color for progress bar
   */
  const getPasswordStrengthColor = (): string => {
    switch (passwordStrength) {
      case 'weak':
        return 'bg-error';
      case 'medium':
        return 'bg-warning';
      case 'strong':
        return 'bg-success';
      default:
        return 'bg-base-300';
    }
  };

  /**
   * Get password strength text
   */
  const getPasswordStrengthText = (): string => {
    switch (passwordStrength) {
      case 'weak':
        return t('auth.validation.passwordWeak');
      case 'medium':
        return t('auth.validation.passwordMedium');
      case 'strong':
        return t('auth.validation.passwordStrong');
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Title */}
          <h2 className="card-title text-3xl font-bold text-center mb-6 justify-center">
            {t('auth.signup.title')}
          </h2>

          {/* Error Alert */}
          {authError && (
            <div className="alert alert-error mb-4" role="alert">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* First Name Field */}
            <div className="form-control w-full mb-4">
              <label className="label" htmlFor="firstName">
                <span className="label-text">{t('auth.signup.firstName')}</span>
              </label>
              <input
                id="firstName"
                type="text"
                placeholder={t('auth.signup.firstNamePlaceholder')}
                className={`input input-bordered w-full ${firstNameError ? 'input-error' : ''}`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={handleFirstNameBlur}
                disabled={isLoading}
                aria-invalid={!!firstNameError}
                aria-describedby={firstNameError ? 'firstName-error' : undefined}
                autoComplete="given-name"
                required
              />
              {firstNameError && (
                <label className="label" id="firstName-error">
                  <span className="label-text-alt text-error">{firstNameError}</span>
                </label>
              )}
            </div>

            {/* Last Name Field */}
            <div className="form-control w-full mb-4">
              <label className="label" htmlFor="lastName">
                <span className="label-text">{t('auth.signup.lastName')}</span>
              </label>
              <input
                id="lastName"
                type="text"
                placeholder={t('auth.signup.lastNamePlaceholder')}
                className={`input input-bordered w-full ${lastNameError ? 'input-error' : ''}`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={handleLastNameBlur}
                disabled={isLoading}
                aria-invalid={!!lastNameError}
                aria-describedby={lastNameError ? 'lastName-error' : undefined}
                autoComplete="family-name"
                required
              />
              {lastNameError && (
                <label className="label" id="lastName-error">
                  <span className="label-text-alt text-error">{lastNameError}</span>
                </label>
              )}
            </div>

            {/* Email Field */}
            <div className="form-control w-full mb-4">
              <label className="label" htmlFor="email">
                <span className="label-text">{t('auth.signup.email')}</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder={t('auth.signup.emailPlaceholder')}
                className={`input input-bordered w-full ${emailError ? 'input-error' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                disabled={isLoading}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
                autoComplete="email"
                required
              />
              {emailError && (
                <label className="label" id="email-error">
                  <span className="label-text-alt text-error">{emailError}</span>
                </label>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control w-full mb-4">
              <label className="label" htmlFor="password">
                <span className="label-text">{t('auth.signup.password')}</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.signup.passwordPlaceholder')}
                  className={`input input-bordered w-full pr-10 ${passwordError ? 'input-error' : ''}`}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={handlePasswordBlur}
                  disabled={isLoading}
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? 'password-error' : 'password-strength'}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="mt-2" id="password-strength">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? getPasswordStrengthColor() : 'bg-base-300'}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? getPasswordStrengthColor() : 'bg-base-300'}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? getPasswordStrengthColor() : 'bg-base-300'}`} />
                  </div>
                  <p className="text-xs mt-1 text-base-content/70">{getPasswordStrengthText()}</p>
                </div>
              )}
              
              {passwordError && (
                <label className="label" id="password-error">
                  <span className="label-text-alt text-error">{passwordError}</span>
                </label>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-control w-full mb-4">
              <label className="label" htmlFor="confirmPassword">
                <span className="label-text">{t('auth.signup.confirmPassword')}</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                  className={`input input-bordered w-full pr-10 ${confirmPasswordError ? 'input-error' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={handleConfirmPasswordBlur}
                  disabled={isLoading}
                  aria-invalid={!!confirmPasswordError}
                  aria-describedby={confirmPasswordError ? 'confirmPassword-error' : undefined}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <label className="label" id="confirmPassword-error">
                  <span className="label-text-alt text-error">{confirmPasswordError}</span>
                </label>
              )}
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="form-control mb-4">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className={`checkbox checkbox-primary ${termsError ? 'checkbox-error' : ''}`}
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  disabled={isLoading}
                  aria-invalid={!!termsError}
                  aria-describedby={termsError ? 'terms-error' : undefined}
                  required
                />
                <span className="label-text">
                  {t('auth.signup.acceptTerms')}{' '}
                  <a href="/terms" className="link link-primary" target="_blank" rel="noopener noreferrer">
                    {t('auth.signup.termsLink')}
                  </a>
                </span>
              </label>
              {termsError && (
                <label className="label" id="terms-error">
                  <span className="label-text-alt text-error">{termsError}</span>
                </label>
              )}
            </div>

            {/* Privacy Policy Checkbox */}
            <div className="form-control mb-6">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="label-text">
                  {t('auth.signup.privacyPolicy')}{' '}
                  <a href="/privacy" className="link link-primary" target="_blank" rel="noopener noreferrer">
                    {t('auth.signup.privacyLink')}
                  </a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full mb-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  {t('auth.signup.loading')}
                </>
              ) : (
                t('auth.signup.submit')
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">{t('common.or')}</div>

          {/* OAuth Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              className="btn btn-outline w-full"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('auth.oauth.google')}
            </button>

            <button
              type="button"
              className="btn btn-outline w-full"
              onClick={handleGitHubSignup}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {t('auth.oauth.github')}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <span className="text-base-content/70">
              {t('auth.signup.hasAccount')}{' '}
            </span>
            <a href="/login" className="link link-primary">
              {t('auth.signup.loginLink')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterComponent;
