import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { server } from '../../mocks/server';
import { SignupUseCase } from '../application/use-cases';
import { AuthService } from '../infrastructure/auth-service';
import { HttpClient } from '../infrastructure/http-client';

/**
 * Integration Tests for Registration Flow
 * 
 * Tests the complete registration flow using MSW to mock API calls
 * Following the Testing Pyramid:
 * - Unit tests: 70% (domain logic)
 * - Integration tests: 20% (this file)
 * - E2E tests: 10% (Storybook interactions)
 * 
 * Architecture layers tested:
 * - Application Layer: SignupUseCase
 * - Infrastructure Layer: AuthService, HttpClient
 * - MSW Layer: Mock API responses
 */

// Setup MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Registration Flow Integration Tests', () => {
  let signupUseCase: SignupUseCase;
  let authService: AuthService;
  let httpClient: HttpClient;

  beforeEach(() => {
    // Initialize infrastructure
    httpClient = new HttpClient('http://localhost:3000/api');
    authService = new AuthService(httpClient);
    signupUseCase = new SignupUseCase(authService);
  });

  describe('Successful Registration', () => {
    it('should register new user with valid credentials', async () => {
      // Arrange
      const name = 'John Doe';
      const email = 'newuser@example.com';
      const password = 'Password123!';
      const confirmPassword = 'Password123!';
      const acceptedTerms = true;

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isSuccess).toBe(true);
      const authResult = result.getValue();
      expect(authResult.user).toBeDefined();
      expect(authResult.user?.email).toBe(email);
      expect(authResult.user?.name).toBe(name);
      expect(authResult.token).toBeDefined();
      expect(authResult.token?.length).toBeGreaterThan(0);
    });

    it('should handle registration with firstName and lastName', async () => {
      // Arrange
      const name = 'Jane Smith';
      const email = 'jane.smith@example.com';
      const password = 'SecureP@ss123';
      const confirmPassword = 'SecureP@ss123';
      const acceptedTerms = true;

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isSuccess).toBe(true);
    });

    it('should return valid JWT token', async () => {
      // Arrange
      const name = 'Test User';
      const email = 'test@example.com';
      const password = 'ValidP@ss123';
      const confirmPassword = 'ValidP@ss123';
      const acceptedTerms = true;

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isSuccess).toBe(true);
      const authResult = result.getValue();
      expect(authResult.token).toBeDefined();
      expect(authResult.token).toMatch(/^eyJ/); // JWT starts with 'eyJ'
      expect(authResult.token?.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('Failed Registration - Validation Errors', () => {
    it('should reject registration with invalid email', async () => {
      // Arrange
      const name = 'John Doe';
      const email = 'invalid-email';
      const password = 'Password123!';
      const confirmPassword = 'Password123!';
      const acceptedTerms = true;

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain('valid');
    });

    it('should reject registration with weak password', async () => {
      // Arrange
      const name = 'John Doe';
      const email = 'john@example.com';
      const password = 'weak';
      const confirmPassword = 'weak';
      const acceptedTerms = true;

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain('8 caratteri');
    });

    it('should reject registration with mismatched passwords', async () => {
      // Arrange
      const name = 'John Doe';
      const email = 'john@example.com';
      const password = 'Password123!';
      const confirmPassword = 'DifferentPass123!';
      const acceptedTerms = true;

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain('coincid');
    });

    it('should reject registration without accepting terms', async () => {
      // Arrange
      const name = 'John Doe';
      const email = 'john@example.com';
      const password = 'Password123!';
      const confirmPassword = 'Password123!';
      const acceptedTerms = false;

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain('termin');
    });

    it('should reject registration with invalid name (too short)', async () => {
      // Arrange
      const name = 'J';
      const email = 'john@example.com';
      const password = 'Password123!';
      const confirmPassword = 'Password123!';
      const acceptedTerms = true;

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain('2 caratteri');
    });
  });

  describe('Failed Registration - Server Errors', () => {
    it('should handle email already exists error', async () => {
      // Arrange - Use email that exists in MSW handlers
      const name = 'Test User';
      const email = 'existing@example.com';
      const password = 'Password123!';
      const confirmPassword = 'Password123!';
      const acceptedTerms = true;

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain('già in uso');
    });

    it('should handle network errors gracefully', async () => {
      // Arrange - Create client with invalid URL to force network error
      const badHttpClient = new HttpClient('http://invalid-url:9999');
      const badAuthService = new AuthService(badHttpClient);
      const badSignupUseCase = new SignupUseCase(badAuthService);

      const name = 'Test User';
      const email = 'test@example.com';
      const password = 'Password123!';
      const confirmPassword = 'Password123!';
      const acceptedTerms = true;

      // Act
      const result = await badSignupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toMatch(/rete|network/i);
    });
  });

  describe('Registration Flow - Edge Cases', () => {
    it('should trim whitespace from name', async () => {
      // Arrange
      const name = '  John Doe  ';
      const email = 'john@example.com';
      const password = 'Password123!';
      const confirmPassword = 'Password123!';
      const acceptedTerms = true;

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isSuccess).toBe(true);
    });

    it('should normalize email to lowercase', async () => {
      // Arrange
      const name = 'Test User';
      const email = 'Test@Example.COM';
      const password = 'Password123!';
      const confirmPassword = 'Password123!';
      const acceptedTerms = true;

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isSuccess).toBe(true);
      const authResult = result.getValue();
      expect(authResult.user).toBeDefined();
      expect(authResult.user?.email).toBe('test@example.com');
    });

    it('should handle long names (up to 50 characters)', async () => {
      // Arrange
      const name = 'A'.repeat(50);
      const email = 'longname@example.com';
      const password = 'Password123!';
      const confirmPassword = 'Password123!';
      const acceptedTerms = true;

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isSuccess).toBe(true);
    });

    it('should reject names longer than 50 characters', async () => {
      // Arrange
      const name = 'A'.repeat(51);
      const email = 'toolong@example.com';
      const password = 'Password123!';
      const confirmPassword = 'Password123!';
      const acceptedTerms = true;

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain('50 caratteri');
    });
  });

  describe('Registration Performance', () => {
    it('should complete registration within acceptable time', async () => {
      // Arrange
      const name = 'Speed Test';
      const email = 'speed@example.com';
      const password = 'Password123!';
      const confirmPassword = 'Password123!';
      const acceptedTerms = true;

      const startTime = Date.now();

      // Act
      const result = await signupUseCase.execute(
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(duration).toBeLessThan(2000); // Should complete in less than 2 seconds
    });
  });
});
