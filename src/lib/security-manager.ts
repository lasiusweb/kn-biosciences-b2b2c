import { NextApiRequest } from 'next';
import { validateEmail, validatePhone, sanitizeInput } from './input-validator';

export interface SecurityHeaders {
  'X-Frame-Options'?: string;
  'X-Content-Type-Options'?: string;
  'X-XSS-Protection'?: string;
  'Strict-Transport-Security'?: string;
  'Content-Security-Policy'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
}

export interface CsrfToken {
  token: string;
  createdAt: number;
  expiresAt: number;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private csrfTokens: Map<string, CsrfToken> = new Map(); // In production, use Redis or DB
  private readonly csrfLifetime = 3600000; // 1 hour
  private readonly maxAttempts = 5;
  private readonly lockoutDuration = 900000; // 15 minutes
  private failedAttempts: Map<string, { count: number; lockedUntil: number }> = new Map();

  private constructor() {}

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Generates security headers for responses
   */
  getSecurityHeaders(): SecurityHeaders {
    return {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://www.google-analytics.com https://ssl.google-analytics.com",
        "img-src 'self' data: https:",
        "frame-src 'self'"
      ].join('; '),
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  /**
   * Validates and sanitizes user input
   */
  validateAndSanitizeInput(input: string, fieldName: string, options: { 
    minLength?: number; 
    maxLength?: number; 
    required?: boolean;
    allowedChars?: RegExp;
  } = {}): { isValid: boolean; sanitizedValue: string; errors: string[] } {
    // Sanitize first
    const sanitized = sanitizeInput(input);
    
    // Then validate
    const validation = validateEmail(fieldName === 'email' ? sanitized : `test@${sanitized}.com`);
    if (fieldName === 'email') {
      return {
        isValid: validation.isValid,
        sanitizedValue: sanitized,
        errors: validation.errors
      };
    }
    
    // For other fields, use general validation
    const textFieldValidation = {
      isValid: true,
      errors: [] as string[]
    };
    
    if (options.required && (!sanitized || sanitized.trim().length === 0)) {
      textFieldValidation.isValid = false;
      textFieldValidation.errors.push(`${fieldName} is required`);
    }
    
    if (sanitized && options.minLength && sanitized.length < options.minLength) {
      textFieldValidation.isValid = false;
      textFieldValidation.errors.push(`${fieldName} must be at least ${options.minLength} characters`);
    }
    
    if (sanitized && options.maxLength && sanitized.length > options.maxLength) {
      textFieldValidation.isValid = false;
      textFieldValidation.errors.push(`${fieldName} must not exceed ${options.maxLength} characters`);
    }
    
    if (sanitized && options.allowedChars && !options.allowedChars.test(sanitized)) {
      textFieldValidation.isValid = false;
      textFieldValidation.errors.push(`${fieldName} contains invalid characters`);
    }
    
    return {
      isValid: textFieldValidation.isValid,
      sanitizedValue: sanitized,
      errors: textFieldValidation.errors
    };
  }

  /**
   * Generates a CSRF token
   */
  generateCsrfToken(sessionId: string): string {
    const token = this.generateSecureToken();
    const csrfToken: CsrfToken = {
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.csrfLifetime
    };

    this.csrfTokens.set(sessionId, csrfToken);
    return token;
  }

  /**
   * Validates a CSRF token
   */
  validateCsrfToken(sessionId: string, token: string): boolean {
    const storedToken = this.csrfTokens.get(sessionId);
    
    if (!storedToken) {
      return false;
    }

    // Check if token is expired
    if (Date.now() > storedToken.expiresAt) {
      this.csrfTokens.delete(sessionId);
      return false;
    }

    // Validate token
    return storedToken.token === token;
  }

  /**
   * Checks if an IP is rate limited
   */
  isIpRateLimited(ip: string): boolean {
    const attemptData = this.failedAttempts.get(ip);
    
    if (!attemptData) {
      return false;
    }

    // Check if lockout period has expired
    if (Date.now() > attemptData.lockedUntil) {
      this.failedAttempts.delete(ip);
      return false;
    }

    // Still locked out
    return attemptData.count >= this.maxAttempts;
  }

  /**
   * Records a failed attempt
   */
  recordFailedAttempt(ip: string): void {
    const attemptData = this.failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
    
    attemptData.count += 1;
    
    if (attemptData.count >= this.maxAttempts) {
      attemptData.lockedUntil = Date.now() + this.lockoutDuration;
    }
    
    this.failedAttempts.set(ip, attemptData);
  }

  /**
   * Resets failed attempts for an IP
   */
  resetFailedAttempts(ip: string): void {
    this.failedAttempts.delete(ip);
  }

  /**
   * Generates a secure random token
   */
  private generateSecureToken(length: number = 32): string {
    // In a real implementation, use crypto.randomBytes
    // For this example, we'll use a simplified approach
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Validates a JWT token (simplified implementation)
   */
  validateJwtToken(token: string): { isValid: boolean; payload?: any; error?: string } {
    try {
      // In a real implementation, use a proper JWT library like jsonwebtoken
      // This is a simplified check
      
      if (!token) {
        return { isValid: false, error: 'Token is required' };
      }

      // Check if token has correct format (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { isValid: false, error: 'Invalid token format' };
      }

      // Decode payload (base64 decode)
      const payload = JSON.parse(atob(parts[1]));
      
      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return { isValid: false, error: 'Token expired' };
      }

      return { isValid: true, payload };
    } catch (error) {
      return { isValid: false, error: 'Invalid token' };
    }
  }

  /**
   * Sanitizes user-generated content to prevent XSS
   */
  sanitizeUserContent(content: string): string {
    return sanitizeInput(content);
  }

  /**
   * Validates a phone number
   */
  validatePhoneNumber(phone: string, countryCode: string = 'IN'): { isValid: boolean; errors: string[] } {
    return validatePhone(phone, countryCode);
  }

  /**
   * Checks for SQL injection patterns
   */
  detectSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|WAITFOR|DELAY)\b)/gi,
      /(;|--|\/\*|\*\/|xp_|sp_|sysobjects|syscolumns)/gi,
      /('%27|%22|%3E|%3C|<|>|'|")/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Checks for XSS patterns
   */
  detectXss(input: string): boolean {
    const xssPatterns = [
      /(<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)|javascript:/gi,
      /(on\w+\s*=)/gi,
      /(<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>)/gi,
      /(<link\b[^>]*>)/gi,
      /(<meta\b[^>]*>)/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Validates request for common attack vectors
   */
  validateRequest(req: NextApiRequest): { isValid: boolean; threats: string[] } {
    const threats: string[] = [];

    // Check for SQL injection in query params
    const queryParams = new URLSearchParams(req.url?.split('?')[1] || '');
    for (const [key, value] of queryParams) {
      if (typeof value === 'string' && this.detectSqlInjection(value)) {
        threats.push(`SQL Injection detected in query param '${key}'`);
      }
      if (typeof value === 'string' && this.detectXss(value)) {
        threats.push(`XSS detected in query param '${key}'`);
      }
    }

    // Check for SQL injection in body
    if (req.body && typeof req.body === 'object') {
      const flattenedBody = this.flattenObject(req.body);
      for (const [key, value] of Object.entries(flattenedBody)) {
        if (typeof value === 'string' && this.detectSqlInjection(value)) {
          threats.push(`SQL Injection detected in body field '${key}'`);
        }
        if (typeof value === 'string' && this.detectXss(value)) {
          threats.push(`XSS detected in body field '${key}'`);
        }
      }
    }

    // Check for suspicious headers
    const suspiciousHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-originating-ip',
      'x-remote-ip',
      'x-remote-addr',
      'x-proxy-user-ip',
      'cf-connecting-ip',
      'true-client-ip',
      'x-cluster-client-ip'
    ];

    for (const header of suspiciousHeaders) {
      if (req.headers[header]) {
        threats.push(`Suspicious header detected: ${header}`);
      }
    }

    return {
      isValid: threats.length === 0,
      threats
    };
  }

  /**
   * Flattens a nested object for easier iteration
   */
  private flattenObject(obj: any, prefix: string = ''): Record<string, any> {
    const flattened: Record<string, any> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, this.flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }

    return flattened;
  }

  /**
   * Hashes a password (simplified implementation)
   */
  async hashPassword(password: string): Promise<string> {
    // In a real implementation, use bcrypt or scrypt
    // This is a simplified approach for demonstration
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // Use Web Crypto API if available (browser/Node.js)
    if (typeof window !== 'undefined' && window.crypto) {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else if (typeof require !== 'undefined') {
      // Node.js environment
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(password).digest('hex');
    } else {
      // Fallback - this shouldn't happen in Next.js
      return password; // This is insecure, just for demo
    }
  }

  /**
   * Verifies a password against a hash (simplified implementation)
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }
}

// Create a singleton instance
export const securityManager = SecurityManager.getInstance();

// Middleware function to protect API routes
export function withSecurityMiddleware(handler: Function) {
  return async (req: NextApiRequest, res: any) => {
    // Add security headers
    const securityHeaders = securityManager.getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      if (value) {
        res.setHeader(key, value);
      }
    });

    // Validate request
    const validation = securityManager.validateRequest(req);
    if (!validation.isValid) {
      console.warn('Security threat detected:', validation.threats);
      res.status(400).json({ error: 'Security validation failed', threats: validation.threats });
      return;
    }

    // Continue with the original handler
    return handler(req, res);
  };
}