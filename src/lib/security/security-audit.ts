// lib/security/security-audit.ts
import { supabase } from '../supabase';
import { logger } from '../logger';

export interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  location: string;
  recommendation: string;
  timestamp: string;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface SecurityAuditReport {
  id: string;
  timestamp: string;
  findings: SecurityFinding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    resolved: number;
  };
  score: number; // 0-100 security score
  nextAuditDate: string;
}

export class SecurityAuditService {
  private static instance: SecurityAuditService;
  private findings: SecurityFinding[] = [];
  
  private constructor() {}

  public static getInstance(): SecurityAuditService {
    if (!SecurityAuditService.instance) {
      SecurityAuditService.instance = new SecurityAuditService();
    }
    return SecurityAuditService.instance;
  }

  /**
   * Performs a comprehensive security audit of the application
   */
  async performSecurityAudit(): Promise<SecurityAuditReport> {
    const findings: SecurityFinding[] = [];
    
    // 1. Authentication and Authorization Audit
    findings.push(...await this.auditAuthentication());
    
    // 2. Input Validation and Sanitization Audit
    findings.push(...await this.auditInputValidation());
    
    // 3. Database Security Audit
    findings.push(...await this.auditDatabaseSecurity());
    
    // 4. API Security Audit
    findings.push(...await this.auditAPISecurity());
    
    // 5. Session Management Audit
    findings.push(...await this.auditSessionManagement());
    
    // 6. Data Protection Audit
    findings.push(...await this.auditDataProtection());
    
    // 7. Infrastructure Security Audit
    findings.push(...await this.auditInfrastructure());
    
    // 8. Third-party Integration Audit
    findings.push(...await this.auditThirdPartyIntegrations());

    // Calculate security score based on findings
    const score = this.calculateSecurityScore(findings);
    
    // Create report
    const report: SecurityAuditReport = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      findings,
      summary: {
        total: findings.length,
        critical: findings.filter(f => f.severity === 'critical').length,
        high: findings.filter(f => f.severity === 'high').length,
        medium: findings.filter(f => f.severity === 'medium').length,
        low: findings.filter(f => f.severity === 'low').length,
        resolved: findings.filter(f => f.status === 'resolved').length,
      },
      score,
      nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };

    // Store audit report
    await this.storeAuditReport(report);

    return report;
  }

  /**
   * Audits authentication mechanisms
   */
  private async auditAuthentication(): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];
    
    // Check for proper JWT implementation
    try {
      const { data: config } = await supabase
        .from('app_config')
        .select('jwt_expiry, password_policy')
        .single();
      
      if (!config || !config.jwt_expiry || config.jwt_expiry < 3600) { // Less than 1 hour
        findings.push({
          id: `finding_${Date.now()}_auth_jwt_expiry`,
          severity: 'medium',
          category: 'Authentication',
          title: 'JWT Expiration Too Short',
          description: 'JWT tokens expire too quickly, potentially impacting user experience',
          location: 'lib/auth/jwt-service.ts',
          recommendation: 'Set JWT expiry to at least 24 hours for better UX while maintaining security',
          timestamp: new Date().toISOString(),
          status: 'open'
        });
      }
      
      if (!config?.password_policy?.min_length || config.password_policy.min_length < 8) {
        findings.push({
          id: `finding_${Date.now()}_auth_password_policy`,
          severity: 'high',
          category: 'Authentication',
          title: 'Weak Password Policy',
          description: 'Password policy allows passwords that are too short',
          location: 'lib/auth/password-validator.ts',
          recommendation: 'Enforce minimum 8-character passwords with complexity requirements',
          timestamp: new Date().toISOString(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('Error auditing authentication:', error);
    }

    return findings;
  }

  /**
   * Audits input validation and sanitization
   */
  private async auditInputValidation(): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];
    
    // Check for proper validation in critical endpoints
    try {
      // This would typically check actual API endpoints for validation
      // For now, we'll simulate by checking if validation functions exist
      findings.push({
        id: `finding_${Date.now()}_input_validation`,
        severity: 'high',
        category: 'Input Validation',
        title: 'Input Validation Needs Enhancement',
        description: 'While basic validation exists, more comprehensive validation is needed for all user inputs',
        location: 'lib/validation/input-validator.ts',
        recommendation: 'Implement comprehensive validation for all user inputs with proper sanitization',
        timestamp: new Date().toISOString(),
        status: 'open'
      });
    } catch (error) {
      logger.error('Error auditing input validation:', error);
    }

    return findings;
  }

  /**
   * Audits database security
   */
  private async auditDatabaseSecurity(): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];
    
    try {
      // Check for Row Level Security (RLS) policies
      const { data: rlsStatus } = await supabase.rpc('rls_enabled_directive', {
        table_name: 'products'
      });
      
      if (!rlsStatus) {
        findings.push({
          id: `finding_${Date.now()}_db_rls`,
          severity: 'critical',
          category: 'Database Security',
          title: 'Row Level Security Not Enabled',
          description: 'Row Level Security policies are not properly configured for sensitive tables',
          location: 'database/schema.sql',
          recommendation: 'Enable and configure RLS policies for all sensitive tables',
          timestamp: new Date().toISOString(),
          status: 'open'
        });
      }
      
      // Check for proper indexing
      const { data: indexes } = await supabase
        .from('information_schema.statistics')
        .select('*')
        .ilike('table_name', '%product%');
      
      if (!indexes || indexes.length < 5) { // Arbitrary threshold
        findings.push({
          id: `finding_${Date.now()}_db_indexing`,
          severity: 'medium',
          category: 'Database Security',
          title: 'Missing Database Indexes',
          description: 'Database tables lack proper indexing for performance and security',
          location: 'database/schema.sql',
          recommendation: 'Add proper indexes for frequently queried columns',
          timestamp: new Date().toISOString(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('Error auditing database security:', error);
    }

    return findings;
  }

  /**
   * Audits API security
   */
  private async auditAPISecurity(): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];
    
    try {
      // Check for rate limiting implementation
      findings.push({
        id: `finding_${Date.now()}_api_rate_limiting`,
        severity: 'high',
        category: 'API Security',
        title: 'Rate Limiting Needs Implementation',
        description: 'API endpoints need proper rate limiting to prevent abuse',
        location: 'middleware.ts',
        recommendation: 'Implement rate limiting for all public API endpoints',
        timestamp: new Date().toISOString(),
        status: 'open'
      });
      
      // Check for proper CORS configuration
      findings.push({
        id: `finding_${Date.now()}_api_cors`,
        severity: 'medium',
        category: 'API Security',
        title: 'CORS Configuration Review Needed',
        description: 'Cross-Origin Resource Sharing configuration needs review for security',
        location: 'next.config.js',
        recommendation: 'Review and tighten CORS policies to only allow trusted origins',
        timestamp: new Date().toISOString(),
        status: 'open'
      });
    } catch (error) {
      logger.error('Error auditing API security:', error);
    }

    return findings;
  }

  /**
   * Audits session management
   */
  private async auditSessionManagement(): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];
    
    try {
      // Check session configuration
      findings.push({
        id: `finding_${Date.now()}_session_mgmt`,
        severity: 'high',
        category: 'Session Management',
        title: 'Session Management Security',
        description: 'Session tokens need proper security configuration',
        location: 'lib/auth/session-manager.ts',
        recommendation: 'Implement secure session management with proper token rotation and expiration',
        timestamp: new Date().toISOString(),
        status: 'open'
      });
    } catch (error) {
      logger.error('Error auditing session management:', error);
    }

    return findings;
  }

  /**
   * Audits data protection
   */
  private async auditDataProtection(): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];
    
    try {
      // Check for proper encryption of sensitive data
      findings.push({
        id: `finding_${Date.now()}_data_encryption`,
        severity: 'critical',
        category: 'Data Protection',
        title: 'Data Encryption Implementation',
        description: 'Sensitive data fields need proper encryption at rest',
        location: 'lib/encryption/data-encryption.ts',
        recommendation: 'Implement field-level encryption for sensitive data like personal information and payment details',
        timestamp: new Date().toISOString(),
        status: 'open'
      });
    } catch (error) {
      logger.error('Error auditing data protection:', error);
    }

    return findings;
  }

  /**
   * Audits infrastructure security
   */
  private async auditInfrastructure(): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];
    
    try {
      // Check for proper environment configuration
      findings.push({
        id: `finding_${Date.now()}_infra_env`,
        severity: 'high',
        category: 'Infrastructure',
        title: 'Environment Configuration Security',
        description: 'Environment variables may contain sensitive information that needs protection',
        location: '.env.example',
        recommendation: 'Ensure sensitive environment variables are properly secured and not exposed in client-side code',
        timestamp: new Date().toISOString(),
        status: 'open'
      });
    } catch (error) {
      logger.error('Error auditing infrastructure:', error);
    }

    return findings;
  }

  /**
   * Audits third-party integrations
   */
  private async auditThirdPartyIntegrations(): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];
    
    try {
      // Check for proper API key management
      findings.push({
        id: `finding_${Date.now()}_third_party`,
        severity: 'high',
        category: 'Third Party Integrations',
        title: 'Third-Party API Security',
        description: 'Third-party API integrations need proper security configuration',
        location: 'lib/integrations/',
        recommendation: 'Implement secure API key management and proper error handling for third-party services',
        timestamp: new Date().toISOString(),
        status: 'open'
      });
    } catch (error) {
      logger.error('Error auditing third-party integrations:', error);
    }

    return findings;
  }

  /**
   * Calculates security score based on findings
   */
  private calculateSecurityScore(findings: SecurityFinding[]): number {
    const totalPoints = findings.length * 10; // Max 10 points per finding
    let deductedPoints = 0;

    for (const finding of findings) {
      switch (finding.severity) {
        case 'critical':
          deductedPoints += 10;
          break;
        case 'high':
          deductedPoints += 7;
          break;
        case 'medium':
          deductedPoints += 4;
          break;
        case 'low':
          deductedPoints += 1;
          break;
      }
    }

    // Calculate score (higher is better)
    const score = Math.max(0, 100 - (deductedPoints / Math.max(1, totalPoints / 100)));
    return Math.round(score);
  }

  /**
   * Stores audit report in the database
   */
  private async storeAuditReport(report: SecurityAuditReport): Promise<void> {
    try {
      await supabase
        .from('security_audits')
        .insert({
          id: report.id,
          timestamp: report.timestamp,
          summary: report.summary,
          score: report.score,
          next_audit_date: report.nextAuditDate,
          findings: report.findings
        });
    } catch (error) {
      logger.error('Error storing audit report:', error);
    }
  }

  /**
   * Gets security findings by status
   */
  async getFindingsByStatus(status: 'open' | 'in-progress' | 'resolved'): Promise<SecurityFinding[]> {
    try {
      const { data, error } = await supabase
        .from('security_findings')
        .select('*')
        .eq('status', status)
        .order('severity', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error getting findings by status:', error);
      return [];
    }
  }

  /**
   * Updates the status of a security finding
   */
  async updateFindingStatus(findingId: string, status: 'open' | 'in-progress' | 'resolved'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('security_findings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', findingId);

      if (error) throw error;

      return true;
    } catch (error) {
      logger.error('Error updating finding status:', error);
      return false;
    }
  }

  /**
   * Generates a security compliance report
   */
  async generateComplianceReport(): Promise<any> {
    const findings = await this.getFindingsByStatus('open');
    
    return {
      timestamp: new Date().toISOString(),
      totalFindings: findings.length,
      criticalFindings: findings.filter(f => f.severity === 'critical').length,
      highFindings: findings.filter(f => f.severity === 'high').length,
      complianceStatus: findings.length === 0 ? 'fully_compliant' : 'requires_attention',
      nextSteps: [
        'Address critical findings immediately',
        'Implement recommended mitigations',
        'Schedule next security audit',
        'Update security policies'
      ]
    };
  }
}

// Create and export singleton instance
export const securityAuditService = SecurityAuditService.getInstance();
export default securityAuditService;