import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export interface SecuritySettings {
  two_factor_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  login_alerts: boolean;
  password_reset_required: boolean;
  last_password_change: string | null;
  suspicious_activity_detected: boolean;
  trusted_devices: TrustedDevice[];
  login_history: LoginHistoryEntry[];
}

export interface TrustedDevice {
  id: string;
  device_name: string;
  browser: string;
  os: string;
  last_accessed: string;
  ip_address: string;
  is_trusted: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  location: string | null;
}

export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  implemented: boolean;
  action_url?: string;
}

export class AccountSecurityService {
  /**
   * Gets security settings for a user
   */
  static async getSecuritySettings(userId: string): Promise<SecuritySettings | null> {
    try {
      // Get user's security settings
      const { data: securityData, error: securityError } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (securityError && securityError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching security settings:', securityError);
        return null;
      }

      // Get trusted devices
      const { data: devicesData, error: devicesError } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false });

      if (devicesError) {
        console.error('Error fetching trusted devices:', devicesError);
        return null;
      }

      // Get recent login history
      const { data: loginData, error: loginError } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (loginError) {
        console.error('Error fetching login history:', loginError);
        return null;
      }

      // Default settings if none exist
      const settings = securityData || {
        user_id: userId,
        two_factor_enabled: false,
        email_notifications: true,
        sms_notifications: false,
        login_alerts: true,
        password_reset_required: false,
        last_password_change: null,
        suspicious_activity_detected: false
      };

      return {
        two_factor_enabled: settings.two_factor_enabled,
        email_notifications: settings.email_notifications,
        sms_notifications: settings.sms_notifications,
        login_alerts: settings.login_alerts,
        password_reset_required: settings.password_reset_required,
        last_password_change: settings.last_password_change,
        suspicious_activity_detected: settings.suspicious_activity_detected,
        trusted_devices: devicesData || [],
        login_history: loginData || []
      };
    } catch (error) {
      console.error('Error getting security settings:', error);
      return null;
    }
  }

  /**
   * Updates security settings for a user
   */
  static async updateSecuritySettings(userId: string, settings: Partial<SecuritySettings>): Promise<{ success: boolean; message: string }> {
    try {
      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (settings.two_factor_enabled !== undefined) {
        updateData.two_factor_enabled = settings.two_factor_enabled;
      }
      if (settings.email_notifications !== undefined) {
        updateData.email_notifications = settings.email_notifications;
      }
      if (settings.sms_notifications !== undefined) {
        updateData.sms_notifications = settings.sms_notifications;
      }
      if (settings.login_alerts !== undefined) {
        updateData.login_alerts = settings.login_alerts;
      }
      if (settings.password_reset_required !== undefined) {
        updateData.password_reset_required = settings.password_reset_required;
      }

      // Upsert security settings
      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: userId,
          ...updateData
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error updating security settings:', error);
        return {
          success: false,
          message: 'Failed to update security settings'
        };
      }

      return {
        success: true,
        message: 'Security settings updated successfully'
      };
    } catch (error) {
      console.error('Error updating security settings:', error);
      return {
        success: false,
        message: 'An error occurred while updating security settings'
      };
    }
  }

  /**
   * Enables/disables two-factor authentication
   */
  static async setTwoFactorAuth(userId: string, enable: boolean): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: userId,
          two_factor_enabled: enable,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error setting two factor auth:', error);
        return {
          success: false,
          message: 'Failed to update two-factor authentication setting'
        };
      }

      return {
        success: true,
        message: `Two-factor authentication ${enable ? 'enabled' : 'disabled'} successfully`
      };
    } catch (error) {
      console.error('Error setting two factor auth:', error);
      return {
        success: false,
        message: 'An error occurred while updating two-factor authentication'
      };
    }
  }

  /**
   * Records a login attempt
   */
  static async recordLoginAttempt(
    userId: string | null,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    location?: string
  ): Promise<void> {
    try {
      await supabase
        .from('login_history')
        .insert({
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          success,
          timestamp: new Date().toISOString(),
          location: location || null
        });
    } catch (error) {
      console.error('Error recording login attempt:', error);
    }
  }

  /**
   * Gets login history for a user
   */
  static async getLoginHistory(userId: string, limit: number = 20): Promise<LoginHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching login history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting login history:', error);
      return [];
    }
  }

  /**
   * Marks a device as trusted
   */
  static async trustDevice(
    userId: string,
    deviceId: string,
    deviceName: string,
    browser: string,
    os: string,
    ipAddress: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('trusted_devices')
        .upsert({
          user_id: userId,
          device_id: deviceId,
          device_name: deviceName,
          browser,
          os,
          ip_address: ipAddress,
          last_accessed: new Date().toISOString(),
          is_trusted: true
        }, { onConflict: ['user_id', 'device_id'] });

      if (error) {
        console.error('Error trusting device:', error);
        return {
          success: false,
          message: 'Failed to trust device'
        };
      }

      return {
        success: true,
        message: 'Device trusted successfully'
      };
    } catch (error) {
      console.error('Error trusting device:', error);
      return {
        success: false,
        message: 'An error occurred while trusting device'
      };
    }
  }

  /**
   * Revokes trust from a device
   */
  static async untrustDevice(userId: string, deviceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('trusted_devices')
        .update({ is_trusted: false })
        .eq('user_id', userId)
        .eq('device_id', deviceId);

      if (error) {
        console.error('Error untrusting device:', error);
        return {
          success: false,
          message: 'Failed to untrust device'
        };
      }

      return {
        success: true,
        message: 'Device trust revoked successfully'
      };
    } catch (error) {
      console.error('Error untrusting device:', error);
      return {
        success: false,
        message: 'An error occurred while revoking device trust'
      };
    }
  }

  /**
   * Performs a security audit for a user
   */
  static async performSecurityAudit(userId: string): Promise<SecurityRecommendation[]> {
    try {
      const recommendations: SecurityRecommendation[] = [];

      // Get current security settings
      const settings = await this.getSecuritySettings(userId);

      if (!settings) {
        return [
          {
            id: 'missing-settings',
            title: 'Security Settings Missing',
            description: 'No security settings found for your account. Please configure your security preferences.',
            severity: 'high',
            implemented: false
          }
        ];
      }

      // Check if 2FA is enabled
      if (!settings.two_factor_enabled) {
        recommendations.push({
          id: 'enable-2fa',
          title: 'Enable Two-Factor Authentication',
          description: 'Add an extra layer of security to your account with 2FA',
          severity: 'high',
          implemented: false,
          action_url: '/account/security'
        });
      }

      // Check password age (if older than 90 days)
      if (settings.last_password_change) {
        const passwordAge = (new Date().getTime() - new Date(settings.last_password_change).getTime()) / (1000 * 60 * 60 * 24);
        if (passwordAge > 90) {
          recommendations.push({
            id: 'change-password',
            title: 'Change Your Password',
            description: 'Your password is older than 90 days. Consider changing it for security.',
            severity: 'medium',
            implemented: false,
            action_url: '/account/security'
          });
        }
      }

      // Check for suspicious activity
      if (settings.suspicious_activity_detected) {
        recommendations.push({
          id: 'review-activity',
          title: 'Review Account Activity',
          description: 'Suspicious activity detected on your account. Please review your recent activity.',
          severity: 'critical',
          implemented: false,
          action_url: '/account/activity'
        });
      }

      // Check for untrusted devices
      if (settings.trusted_devices.length === 0) {
        recommendations.push({
          id: 'no-trusted-devices',
          title: 'No Trusted Devices',
          description: 'You have no trusted devices registered. Consider trusting devices you use regularly.',
          severity: 'medium',
          implemented: false,
          action_url: '/account/devices'
        });
      }

      // Check for failed login attempts
      const recentLogins = await this.getLoginHistory(userId, 10);
      const failedAttempts = recentLogins.filter(login => !login.success);
      if (failedAttempts.length > 3) {
        recommendations.push({
          id: 'failed-logins',
          title: 'Multiple Failed Login Attempts',
          description: 'There have been multiple failed login attempts to your account recently.',
          severity: 'high',
          implemented: false,
          action_url: '/account/activity'
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error performing security audit:', error);
      return [];
    }
  }

  /**
   * Forces password reset for a user
   */
  static async forcePasswordReset(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Update security settings to require password reset
      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: userId,
          password_reset_required: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error forcing password reset:', error);
        return {
          success: false,
          message: 'Failed to force password reset'
        };
      }

      return {
        success: true,
        message: 'Password reset required. User will be prompted to change password on next login.'
      };
    } catch (error) {
      console.error('Error forcing password reset:', error);
      return {
        success: false,
        message: 'An error occurred while forcing password reset'
      };
    }
  }

  /**
   * Checks if password reset is required for a user
   */
  static async isPasswordResetRequired(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_security_settings')
        .select('password_reset_required')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error checking password reset requirement:', error);
        return false;
      }

      return data?.password_reset_required || false;
    } catch (error) {
      console.error('Error checking password reset requirement:', error);
      return false;
    }
  }

  /**
   * Updates the last password change date
   */
  static async updatePasswordChangeDate(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: userId,
          last_password_change: new Date().toISOString(),
          password_reset_required: false, // Reset the forced reset flag
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error updating password change date:', error);
        return {
          success: false,
          message: 'Failed to update password change date'
        };
      }

      return {
        success: true,
        message: 'Password change date updated successfully'
      };
    } catch (error) {
      console.error('Error updating password change date:', error);
      return {
        success: false,
        message: 'An error occurred while updating password change date'
      };
    }
  }

  /**
   * Detects suspicious activity
   */
  static async detectSuspiciousActivity(userId: string): Promise<boolean> {
    try {
      // Get recent login history
      const recentLogins = await this.getLoginHistory(userId, 20);

      // Check for multiple failed attempts followed by success (possible brute force)
      let consecutiveFailures = 0;
      for (let i = 0; i < recentLogins.length; i++) {
        if (!recentLogins[i].success) {
          consecutiveFailures++;
        } else {
          // If we had failures before a success, that's suspicious
          if (consecutiveFailures > 3) {
            return true;
          }
          consecutiveFailures = 0;
        }
      }

      // Check for logins from different geographical locations in a short period
      const loginsInLastDay = recentLogins.filter(login => {
        const loginTime = new Date(login.timestamp).getTime();
        const now = new Date().getTime();
        return (now - loginTime) < (24 * 60 * 60 * 1000); // Within last 24 hours
      });

      const uniqueLocations = new Set(loginsInLastDay.map(login => login.location).filter(loc => loc));
      if (uniqueLocations.size > 2) {
        // Multiple locations in 24 hours is suspicious
        return true;
      }

      // Check for logins at unusual times
      const now = new Date();
      const hour = now.getHours();
      // If it's between midnight and 5am, and user typically logs in during day
      if (hour >= 0 && hour < 5) {
        // Check if user typically logs in during day hours
        const typicalHours = recentLogins.reduce((hours, login) => {
          const loginHour = new Date(login.timestamp).getHours();
          hours[loginHour] = (hours[loginHour] || 0) + 1;
          return hours;
        }, {} as Record<number, number>);

        // Calculate average login hour
        let totalWeightedHours = 0;
        let totalCount = 0;
        for (const [hour, count] of Object.entries(typicalHours)) {
          totalWeightedHours += parseInt(hour) * count;
          totalCount += count;
        }

        const avgLoginHour = totalCount > 0 ? totalWeightedHours / totalCount : 12;
        if (avgLoginHour >= 6 && avgLoginHour <= 22 && hour < 5) {
          // User typically logs in during day but just logged in at night
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return false;
    }
  }

  /**
   * Sends security alert to user
   */
  static async sendSecurityAlert(userId: string, alertType: string, details: string): Promise<void> {
    try {
      // In a real implementation, this would send an email/SMS notification
      // For now, we'll just log the alert to the database
      
      await supabase
        .from('security_alerts')
        .insert({
          user_id: userId,
          alert_type: alertType,
          details,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });

      // In a real implementation, you would send an email or SMS here
      console.log(`Security alert sent to user ${userId}: ${alertType} - ${details}`);
    } catch (error) {
      console.error('Error sending security alert:', error);
    }
  }
}