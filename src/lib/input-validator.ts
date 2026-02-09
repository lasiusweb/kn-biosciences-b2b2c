// Input validation utilities for KN Biosciences application
import validator from 'validator';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

export class InputValidator {
  /**
   * Validates an email address
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
    } else if (!validator.isEmail(email)) {
      errors.push('Invalid email format');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a phone number
   */
  static validatePhone(phone: string, countryCode: string = 'IN'): ValidationResult {
    const errors: string[] = [];
    
    if (!phone) {
      errors.push('Phone number is required');
    } else {
      // For Indian numbers, check if it's a valid 10-digit number
      if (countryCode === 'IN') {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length !== 10) {
          errors.push('Indian phone number must be 10 digits');
        } else if (!/^([6-9])/g.test(cleaned)) {
          errors.push('Indian phone number must start with 6, 7, 8, or 9');
        }
      } else {
        // For international numbers, use a more general validation
        if (phone.length < 7 || phone.length > 15) {
          errors.push('Phone number length should be between 7 and 15 digits');
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a GST number (for Indian businesses)
   */
  static validateGSTNumber(gstNumber: string): ValidationResult {
    const errors: string[] = [];
    
    if (gstNumber) {
      // GST format: 2 digits, 10 alphanumeric chars, 1 alphabet, 1 digit, 1 alphabet
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
      
      if (!gstRegex.test(gstNumber.toUpperCase())) {
        errors.push('Invalid GST number format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a product quantity
   */
  static validateQuantity(quantity: number, maxAllowed?: number): ValidationResult {
    const errors: string[] = [];
    
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      errors.push('Quantity must be a number');
    } else if (quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    } else if (!Number.isInteger(quantity)) {
      errors.push('Quantity must be a whole number');
    } else if (maxAllowed && quantity > maxAllowed) {
      errors.push(`Quantity cannot exceed ${maxAllowed}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a PIN code (for Indian addresses)
   */
  static validatePinCode(pinCode: string): ValidationResult {
    const errors: string[] = [];
    
    if (!pinCode) {
      errors.push('PIN code is required');
    } else {
      const cleaned = pinCode.replace(/\D/g, '');
      if (cleaned.length !== 6) {
        errors.push('PIN code must be 6 digits');
      } else {
        // First digit should be between 1-9, not 0
        if (!/^([1-9])/g.test(cleaned)) {
          errors.push('PIN code first digit cannot be 0');
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitizes user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Remove script tags and other potentially dangerous content
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Validates a generic text field
   */
  static validateTextField(
    value: string, 
    fieldName: string, 
    options: { 
      minLength?: number; 
      maxLength?: number; 
      required?: boolean;
      allowedChars?: RegExp;
    } = {}
  ): ValidationResult {
    const errors: string[] = [];
    
    if (options.required && (!value || value.trim().length === 0)) {
      errors.push(`${fieldName} is required`);
    }
    
    if (value && options.minLength && value.length < options.minLength) {
      errors.push(`${fieldName} must be at least ${options.minLength} characters`);
    }
    
    if (value && options.maxLength && value.length > options.maxLength) {
      errors.push(`${fieldName} must not exceed ${options.maxLength} characters`);
    }
    
    if (value && options.allowedChars && !options.allowedChars.test(value)) {
      errors.push(`${fieldName} contains invalid characters`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates an address object
   */
  static validateAddress(address: any): ValidationResult {
    const errors: string[] = [];
    
    if (!address.address_line1) {
      errors.push('Address line 1 is required');
    }
    
    if (!address.city) {
      errors.push('City is required');
    }
    
    if (!address.state) {
      errors.push('State is required');
    }
    
    if (!address.country) {
      errors.push('Country is required');
    }
    
    const pinValidation = this.validatePinCode(address.postal_code);
    if (!pinValidation.isValid) {
      errors.push(...pinValidation.errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Convenience functions for common validations
export const validateEmail = (email: string) => InputValidator.validateEmail(email);
export const validatePhone = (phone: string, countryCode: string = 'IN') => InputValidator.validatePhone(phone, countryCode);
export const validateGSTNumber = (gstNumber: string) => InputValidator.validateGSTNumber(gstNumber);
export const validateQuantity = (quantity: number, maxAllowed?: number) => InputValidator.validateQuantity(quantity, maxAllowed);
export const validatePinCode = (pinCode: string) => InputValidator.validatePinCode(pinCode);
export const validateTextField = (value: string, fieldName: string, options: { minLength?: number; maxLength?: number; required?: boolean; allowedChars?: RegExp; } = {}) => InputValidator.validateTextField(value, fieldName, options);
export const sanitizeInput = (input: string) => InputValidator.sanitizeInput(input);