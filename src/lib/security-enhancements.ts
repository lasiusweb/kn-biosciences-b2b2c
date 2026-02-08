// Enhanced security middleware for KN Biosciences application
import { NextApiRequest, NextApiResponse } from 'next';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xss from 'xss-clean';
import { body, validationResult, query, param } from 'express-validator';
import { createClient, RedisClientType } from 'redis';
import crypto from 'crypto';

// Rate limiter configuration
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Slow down requests for brute force protection
export const loginLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 3, // Begin slowing down after 3 requests
  delayMs: 500, // Each request after the 3rd adds 500ms of delay
  maxDelayMs: 10 * 1000, // Cap the delay at 10 seconds
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", 'https://www.google-analytics.com', 'https://*.supabase.co'],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
});

// Input sanitization middleware
export const sanitizeInputs = mongoSanitize();
export const sanitizeXSS = xss();

// CSRF token generator and validator
class CSRFProtection {
  private redisClient: RedisClientType;
  private tokenExpiry: number = 3600; // 1 hour

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.redisClient.connect();
  }

  // Generate a new CSRF token
  async generateToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const key = `csrf:${userId}`;
    
    await this.redisClient.setEx(key, this.tokenExpiry, token);
    return token;
  }

  // Validate CSRF token
  async validateToken(userId: string, token: string): Promise<boolean> {
    const key = `csrf:${userId}`;
    const storedToken = await this.redisClient.get(key);
    
    if (!storedToken) {
      return false;
    }
    
    // Compare tokens securely to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(storedToken),
      Buffer.from(token)
    );
    
    // Remove token after use (one-time use)
    if (isValid) {
      await this.redisClient.del(key);
    }
    
    return isValid;
  }
}

export const csrfProtection = new CSRFProtection();

// JWT token validation utility
export class JWTValidator {
  private secret: string;
  
  constructor(secret: string) {
    this.secret = secret;
  }

  // Verify JWT token
  verifyToken(token: string): { valid: boolean; payload?: any; error?: string } {
    try {
      // In a real implementation, use a proper JWT library like jsonwebtoken
      // This is a simplified version for demonstration
      
      if (!token) {
        return { valid: false, error: 'Token is required' };
      }

      // Remove Bearer prefix if present
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      
      // Basic validation - in production, implement proper JWT verification
      if (cleanToken.length < 10) {
        return { valid: false, error: 'Invalid token format' };
      }

      // In a real implementation, decode and verify the JWT
      // const decoded = jwt.verify(cleanToken, this.secret);
      // return { valid: true, payload: decoded };
      
      // For now, return a mock validation
      return { valid: true, payload: { userId: 'mock-user-id', role: 'customer' } };
    } catch (error) {
      return { valid: false, error: (error as Error).message };
    }
  }
}

// Security validation rules
export const validationRules = {
  // User registration validation
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('firstName')
      .trim()
      .isLength({ min: 1, max: 30 })
      .withMessage('First name must be between 1 and 30 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 1, max: 30 })
      .withMessage('Last name must be between 1 and 30 characters'),
    body('phone')
      .optional()
      .isMobilePhone('any', { strictMode: false })
      .withMessage('Please provide a valid phone number'),
  ],

  // Login validation
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],

  // Product search validation
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search query must be less than 100 characters'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a positive integer'),
  ],

  // Product ID validation
  productId: [
    param('id')
      .isUUID()
      .withMessage('Invalid product ID format'),
  ],

  // Order validation
  order: [
    body('shippingAddress')
      .isObject()
      .withMessage('Shipping address must be an object'),
    body('billingAddress')
      .isObject()
      .withMessage('Billing address must be an object'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('Order must contain at least one item'),
    body('items.*.productId')
      .isUUID()
      .withMessage('Invalid product ID in order'),
    body('items.*.quantity')
      .isInt({ min: 1, max: 100 })
      .withMessage('Quantity must be between 1 and 100'),
  ]
};

// Security middleware for API routes
export function withSecurityMiddleware(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Apply security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Validate request
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.array()
      });
    }

    // Continue with the original handler
    return handler(req, res);
  };
}

// Honeypot middleware to catch bots
export function honeypotMiddleware(req: NextApiRequest, res: NextApiResponse, next: Function) {
  // Check for honeypot field (bots often fill all fields)
  if (req.body._honeypot && req.body._honeypot.trim() !== '') {
    return res.status(400).json({ error: 'Bot detected' });
  }
  
  next();
}

// Request ID middleware for tracking
export function requestIdMiddleware(req: NextApiRequest, res: NextApiResponse, next: Function) {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
}

// Security audit logging
export class SecurityAuditLogger {
  async logSecurityEvent(eventType: string, details: any, userId?: string) {
    // In a real implementation, this would log to a secure audit trail
    console.log(`SECURITY EVENT: ${eventType}`, {
      timestamp: new Date().toISOString(),
      userId,
      details,
      requestId: details.requestId || 'unknown'
    });
    
    // In production, send to a secure logging system
    // This could be a SIEM solution or a dedicated audit log database
  }
  
  async logFailedLogin(attempt: { ip: string, email: string, userAgent?: string }) {
    await this.logSecurityEvent('FAILED_LOGIN_ATTEMPT', {
      ip: attempt.ip,
      email: attempt.email,
      userAgent: attempt.userAgent
    });
  }
  
  async logSuspiciousActivity(activity: { 
    ip: string, 
    userId?: string, 
    action: string, 
    details: any 
  }) {
    await this.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
      ip: activity.ip,
      userId: activity.userId,
      action: activity.action,
      details: activity.details
    });
  }
}

export const securityAuditLogger = new SecurityAuditLogger();

// Security utility functions
export const SecurityUtils = {
  // Generate cryptographically secure random values
  generateSecureRandom: (size: number = 32): string => {
    return crypto.randomBytes(size).toString('hex');
  },

  // Hash sensitive data
  hashData: (data: string, salt?: string): string => {
    const s = salt || crypto.randomBytes(16).toString('hex');
    return crypto.pbkdf2Sync(data, s, 10000, 64, 'sha512').toString('hex');
  },

  // Validate JWT tokens
  validateJWT: (token: string, secret: string): boolean => {
    // In a real implementation, use a proper JWT library
    // This is a simplified version for demonstration
    try {
      // Remove Bearer prefix if present
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      
      // Basic validation
      if (cleanToken.length < 10) {
        return false;
      }
      
      // In a real implementation, verify the JWT signature
      return true;
    } catch (error) {
      return false;
    }
  },

  // Validate email format
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number
  validatePhone: (phone: string, country: string = 'IN'): boolean => {
    // For India, validate 10-digit mobile numbers
    if (country === 'IN') {
      const phoneRegex = /^[6-9]\d{9}$/;
      return phoneRegex.test(phone.replace(/\D/g, ''));
    }
    
    // For other countries, use a more general validation
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 7 && cleaned.length <= 15;
  },

  // Sanitize user input
  sanitizeInput: (input: string): string => {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  },

  // Check for SQL injection patterns
  detectSqlInjection: (input: string): boolean => {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|WAITFOR|DELAY)\b)/gi,
      /(;|--|\/\*|\*\/|xp_|sp_|sysobjects|syscolumns)/gi,
      /('%27|%22|%3E|%3C|<|>|'|")/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  },

  // Check for XSS patterns
  detectXss: (input: string): boolean => {
    const xssPatterns = [
      /(<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)|javascript:/gi,
      /(on\w+\s*=)/gi,
      /(<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>)/gi,
      /(<link\b[^>]*>)/gi,
      /(<meta\b[^>]*>)/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }
};

// Export all security utilities
export default {
  apiLimiter,
  loginLimiter,
  securityHeaders,
  sanitizeInputs,
  sanitizeXSS,
  csrfProtection,
  JWTValidator,
  validationRules,
  withSecurityMiddleware,
  honeypotMiddleware,
  requestIdMiddleware,
  SecurityAuditLogger,
  securityAuditLogger,
  SecurityUtils
};