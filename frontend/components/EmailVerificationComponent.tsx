import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

/**
 * EmailVerificationComponent - Email Verification Flow
 * 
 * Two modes:
 * 1. Request verification code (user enters email)
 * 2. Verify code (user enters 6-digit code from email)
 * 
 * Clean Architecture:
 * - Presentation Layer: UI Component
 * - Uses EmailVerificationUseCase (to be implemented)
 * - Domain Layer: Email Value Object for validation
 * 
 * Features:
 * - Send verification code to email
 * - 6-digit code input with auto-focus
 * - Code expiry (5 minutes)
 * - Resend code functionality
 * - Error handling
 * - Multi-language support
 */
const EmailVerificationComponent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get email from URL query params (if coming from registration)
  const emailFromUrl = searchParams.get('email') || '';
  
  // Component state
  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isCodeSent, setIsCodeSent] = useState(!!emailFromUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(300); // 5 minutes in seconds

  /**
   * Send verification code to email
   */
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Call EmailVerificationUseCase.sendCode(email)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsCodeSent(true);
      setSuccess(t('auth.verification.codeSent'));
      startCountdown();
    } catch (err) {
      setError(t('auth.messages.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify the 6-digit code
   */
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError(t('auth.verification.invalidCode'));
      setIsLoading(false);
      return;
    }
    
    try {
      // TODO: Call EmailVerificationUseCase.verifyCode(email, verificationCode)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(t('auth.verification.emailVerified'));
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(t('auth.verification.codeExpiredOrInvalid'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle code input change
   */
  const handleCodeChange = (index: number, value: string) => {
    // Only accept digits
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  /**
   * Handle backspace in code input
   */
  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  /**
   * Resend verification code
   */
  const handleResendCode = async () => {
    setIsLoading(true);
    setError(null);
    setCode(['', '', '', '', '', '']);
    
    try {
      // TODO: Call EmailVerificationUseCase.resendCode(email)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(t('auth.verification.codeResent'));
      setExpiresIn(300); // Reset to 5 minutes
      startCountdown();
    } catch (err) {
      setError(t('auth.messages.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Start countdown timer for code expiry
   */
  const startCountdown = () => {
    const interval = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Format seconds to MM:SS
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Title */}
          <h2 className="card-title text-3xl font-bold text-center mb-6 justify-center">
            {t('auth.verification.title')}
          </h2>

          {/* Description */}
          <p className="text-center text-base-content/70 mb-6">
            {isCodeSent
              ? t('auth.verification.enterCodeDescription', { email })
              : t('auth.verification.requestCodeDescription')}
          </p>

          {/* Success Alert */}
          {success && (
            <div className="alert alert-success mb-4" role="alert">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-4" role="alert">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {!isCodeSent ? (
            /* Request Code Form */
            <form onSubmit={handleSendCode}>
              <div className="form-control w-full mb-4">
                <label className="label" htmlFor="email">
                  <span className="label-text">{t('auth.verification.email')}</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder={t('auth.verification.emailPlaceholder')}
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mb-4"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    {t('common.loading')}
                  </>
                ) : (
                  t('auth.verification.sendCode')
                )}
              </button>
            </form>
          ) : (
            /* Verify Code Form */
            <form onSubmit={handleVerifyCode}>
              {/* 6-digit Code Input */}
              <div className="flex justify-center gap-2 mb-6">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    className="input input-bordered w-12 h-12 text-center text-xl font-bold"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    disabled={isLoading || expiresIn === 0}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Timer */}
              {expiresIn > 0 && (
                <div className="text-center mb-4">
                  <p className="text-sm text-base-content/70">
                    {t('auth.verification.codeExpires')}: <span className="font-bold">{formatTime(expiresIn)}</span>
                  </p>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                className="btn btn-primary w-full mb-4"
                disabled={isLoading || code.join('').length !== 6 || expiresIn === 0}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    {t('common.loading')}
                  </>
                ) : (
                  t('auth.verification.verifyCode')
                )}
              </button>

              {/* Resend Code */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="link link-primary"
                  disabled={isLoading || expiresIn > 0}
                >
                  {t('auth.verification.resendCode')}
                </button>
              </div>
            </form>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6">
            <Link to="/login" className="link link-primary">
              {t('common.back')} {t('auth.login.title')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationComponent;
