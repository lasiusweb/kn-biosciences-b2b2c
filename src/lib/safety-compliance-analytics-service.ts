import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

export interface SafetyComplianceAnalytics {
  totalProducts: number;
  productsWithSafetyInfo: number;
  productsWithComplianceInfo: number;
  productsWithBoth: number;
  missingSafetyInfo: number;
  missingComplianceInfo: number;
  complianceByType: {
    cbirc: number;
    manufacturingLicense: number;
    gtin: number;
    countryOfOrigin: number;
  };
  safetyByType: {
    chemicalComposition: number;
    safetyWarnings: number;
    antidoteStatement: number;
    directionsOfUse: number;
    precautions: number;
  };
  topBrandsByCompliance: Array<{
    brand: string;
    compliantProducts: number;
    totalProducts: number;
    complianceRate: number;
  }>;
  complianceTrends: Array<{
    month: string;
    compliantProducts: number;
    totalProducts: number;
  }>;
}

export interface SafetyAlert {
  id: string;
  productId: string;
  productName: string;
  brandName?: string;
  alertType: 'missing_safety_info' | 'missing_compliance' | 'expiring_certification';
  severity: 'low' | 'medium' | 'high';
  message: string;
  createdAt: string;
}

export interface ComplianceReport {
  reportId: string;
  generatedAt: string;
  generatedBy: string;
  periodStart: string;
  periodEnd: string;
  summary: {
    totalProducts: number;
    compliantProducts: number;
    nonCompliantProducts: number;
    complianceRate: number;
  };
  details: Array<{
    productId: string;
    productName: string;
    brandName?: string;
    segment: string;
    complianceStatus: 'compliant' | 'non_compliant' | 'partial';
    missingFields: string[];
    recommendations: string[];
  }>;
}

export class SafetyComplianceAnalyticsService {
  /**
   * Gets safety and compliance analytics
   */
  static async getAnalytics(): Promise<SafetyComplianceAnalytics> {
    try {
      // Get all products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        console.error('Error fetching products for analytics:', productsError);
        throw productsError;
      }

      if (!products) {
        return {
          totalProducts: 0,
          productsWithSafetyInfo: 0,
          productsWithComplianceInfo: 0,
          productsWithBoth: 0,
          missingSafetyInfo: 0,
          missingComplianceInfo: 0,
          complianceByType: {
            cbirc: 0,
            manufacturingLicense: 0,
            gtin: 0,
            countryOfOrigin: 0
          },
          safetyByType: {
            chemicalComposition: 0,
            safetyWarnings: 0,
            antidoteStatement: 0,
            directionsOfUse: 0,
            precautions: 0
          },
          topBrandsByCompliance: [],
          complianceTrends: []
        };
      }

      const totalProducts = products.length;
      let productsWithSafetyInfo = 0;
      let productsWithComplianceInfo = 0;
      let productsWithBoth = 0;
      let missingSafetyInfo = 0;
      let missingComplianceInfo = 0;

      // Count compliance by type
      const complianceByType = {
        cbirc: 0,
        manufacturingLicense: 0,
        gtin: 0,
        countryOfOrigin: 0
      };

      // Count safety by type
      const safetyByType = {
        chemicalComposition: 0,
        safetyWarnings: 0,
        antidoteStatement: 0,
        directionsOfUse: 0,
        precautions: 0
      };

      // Process each product
      products.forEach(product => {
        const hasSafetyInfo = 
          product.chemical_composition || 
          product.safety_warnings || 
          product.antidote_statement || 
          product.directions_of_use || 
          product.precautions;

        const hasComplianceInfo = 
          product.cbirc_compliance || 
          product.manufacturing_license || 
          product.gtin || 
          product.country_of_origin;

        if (hasSafetyInfo) {
          productsWithSafetyInfo++;
          
          if (product.chemical_composition) safetyByType.chemicalComposition++;
          if (product.safety_warnings) safetyByType.safetyWarnings++;
          if (product.antidote_statement) safetyByType.antidoteStatement++;
          if (product.directions_of_use) safetyByType.directionsOfUse++;
          if (product.precautions) safetyByType.precautions++;
        } else {
          missingSafetyInfo++;
        }

        if (hasComplianceInfo) {
          productsWithComplianceInfo++;
          
          if (product.cbirc_compliance) complianceByType.cbirc++;
          if (product.manufacturing_license) complianceByType.manufacturingLicense++;
          if (product.gtin) complianceByType.gtin++;
          if (product.country_of_origin) complianceByType.countryOfOrigin++;
        } else {
          missingComplianceInfo++;
        }

        if (hasSafetyInfo && hasComplianceInfo) {
          productsWithBoth++;
        }
      });

      // Get top brands by compliance
      const brandComplianceMap = new Map<string, { compliant: number; total: number }>();
      
      products.forEach(product => {
        if (!product.brand_name) return;
        
        if (!brandComplianceMap.has(product.brand_name)) {
          brandComplianceMap.set(product.brand_name, { compliant: 0, total: 0 });
        }
        
        const brandData = brandComplianceMap.get(product.brand_name)!;
        brandData.total++;
        
        const hasComplianceInfo = 
          product.cbirc_compliance || 
          product.manufacturing_license || 
          product.gtin || 
          product.country_of_origin;
          
        if (hasComplianceInfo) {
          brandData.compliant++;
        }
      });

      const topBrandsByCompliance = Array.from(brandComplianceMap.entries())
        .map(([brand, data]) => ({
          brand,
          compliantProducts: data.compliant,
          totalProducts: data.total,
          complianceRate: data.total > 0 ? (data.compliant / data.total) * 100 : 0
        }))
        .sort((a, b) => b.complianceRate - a.complianceRate)
        .slice(0, 10); // Top 10 brands

      // Generate compliance trends (mock data for now)
      const complianceTrends = [
        { month: 'Jan', compliantProducts: Math.floor(totalProducts * 0.65), totalProducts },
        { month: 'Feb', compliantProducts: Math.floor(totalProducts * 0.68), totalProducts },
        { month: 'Mar', compliantProducts: Math.floor(totalProducts * 0.72), totalProducts },
        { month: 'Apr', compliantProducts: Math.floor(totalProducts * 0.75), totalProducts },
        { month: 'May', compliantProducts: Math.floor(totalProducts * 0.78), totalProducts },
        { month: 'Jun', compliantProducts: Math.floor(totalProducts * 0.82), totalProducts },
      ];

      return {
        totalProducts,
        productsWithSafetyInfo,
        productsWithComplianceInfo,
        productsWithBoth,
        missingSafetyInfo,
        missingComplianceInfo,
        complianceByType,
        safetyByType,
        topBrandsByCompliance,
        complianceTrends
      };
    } catch (error) {
      console.error('Error getting safety and compliance analytics:', error);
      throw error;
    }
  }

  /**
   * Gets safety alerts
   */
  static async getSafetyAlerts(limit: number = 20): Promise<SafetyAlert[]> {
    try {
      // Get products with missing safety/compliance info
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, brand_name, chemical_composition, safety_warnings, cbirc_compliance, manufacturing_license')
        .or('chemical_composition.is.null,safety_warnings.is.null,cbirc_compliance.is.null,manufacturing_license.is.null');

      if (productsError) {
        console.error('Error fetching products for alerts:', productsError);
        return [];
      }

      if (!products) return [];

      const alerts: SafetyAlert[] = [];

      products.forEach(product => {
        // Check for missing safety info
        if (!product.chemical_composition || !product.safety_warnings) {
          alerts.push({
            id: `alert-${product.id}-safety`,
            productId: product.id,
            productName: product.name,
            brandName: product.brand_name,
            alertType: 'missing_safety_info',
            severity: product.chemical_composition ? 'low' : 'high',
            message: `Missing ${!product.chemical_composition ? 'chemical composition' : ''}${!product.chemical_composition && !product.safety_warnings ? ' and ' : ''}${!product.safety_warnings ? 'safety warnings' : ''}`,
            createdAt: new Date().toISOString()
          });
        }

        // Check for missing compliance info
        if (!product.cbirc_compliance || !product.manufacturing_license) {
          alerts.push({
            id: `alert-${product.id}-compliance`,
            productId: product.id,
            productName: product.name,
            brandName: product.brand_name,
            alertType: 'missing_compliance',
            severity: product.cbirc_compliance ? 'low' : 'high',
            message: `Missing ${!product.cbirc_compliance ? 'CBIRC compliance' : ''}${!product.cbirc_compliance && !product.manufacturing_license ? ' and ' : ''}${!product.manufacturing_license ? 'manufacturing license' : ''}`,
            createdAt: new Date().toISOString()
          });
        }
      });

      // Sort by severity and date, then limit
      return alerts
        .sort((a, b) => {
          const severityOrder = { high: 3, medium: 2, low: 1 };
          if (severityOrder[b.severity] !== severityOrder[a.severity]) {
            return severityOrder[b.severity] - severityOrder[a.severity];
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting safety alerts:', error);
      return [];
    }
  }

  /**
   * Generates a compliance report
   */
  static async generateComplianceReport(
    periodStart: string,
    periodEnd: string,
    userId: string
  ): Promise<ComplianceReport> {
    try {
      // Get all products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        console.error('Error fetching products for report:', productsError);
        throw productsError;
      }

      if (!products) {
        return {
          reportId: `report-${Date.now()}`,
          generatedAt: new Date().toISOString(),
          generatedBy: userId,
          periodStart,
          periodEnd,
          summary: {
            totalProducts: 0,
            compliantProducts: 0,
            nonCompliantProducts: 0,
            complianceRate: 0
          },
          details: []
        };
      }

      const details = products.map(product => {
        const missingFields: string[] = [];
        
        if (!product.cbirc_compliance) missingFields.push('CBIRC Compliance');
        if (!product.manufacturing_license) missingFields.push('Manufacturing License');
        if (!product.gtin) missingFields.push('GTIN/EAN/UPC');
        if (!product.country_of_origin) missingFields.push('Country of Origin');
        if (!product.chemical_composition) missingFields.push('Chemical Composition');
        if (!product.safety_warnings) missingFields.push('Safety Warnings');
        if (!product.antidote_statement) missingFields.push('Antidote Statement');

        const complianceStatus = missingFields.length === 0 
          ? 'compliant' 
          : missingFields.length <= 2 
            ? 'partial' 
            : 'non_compliant';

        const recommendations = missingFields.length > 0
          ? [`Add missing fields: ${missingFields.join(', ')}`]
          : ['Product is fully compliant'];

        return {
          productId: product.id,
          productName: product.name,
          brandName: product.brand_name,
          segment: product.segment,
          complianceStatus,
          missingFields,
          recommendations
        };
      });

      const compliantProducts = details.filter(d => d.complianceStatus === 'compliant').length;
      const nonCompliantProducts = details.filter(d => d.complianceStatus === 'non_compliant').length;
      const complianceRate = products.length > 0 ? (compliantProducts / products.length) * 100 : 0;

      return {
        reportId: `report-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        generatedBy: userId,
        periodStart,
        periodEnd,
        summary: {
          totalProducts: products.length,
          compliantProducts,
          nonCompliantProducts,
          complianceRate
        },
        details
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  /**
   * Gets compliance by segment
   */
  static async getComplianceBySegment(): Promise<Array<{
    segment: string;
    totalProducts: number;
    compliantProducts: number;
    complianceRate: number;
  }>> {
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        console.error('Error fetching products for segment analysis:', productsError);
        return [];
      }

      if (!products) return [];

      // Group by segment
      const segmentMap = new Map<string, { total: number; compliant: number }>();
      
      products.forEach(product => {
        if (!product.segment) return;
        
        if (!segmentMap.has(product.segment)) {
          segmentMap.set(product.segment, { total: 0, compliant: 0 });
        }
        
        const segmentData = segmentMap.get(product.segment)!;
        segmentData.total++;
        
        const hasComplianceInfo = 
          product.cbirc_compliance || 
          product.manufacturing_license || 
          product.gtin || 
          product.country_of_origin;
          
        if (hasComplianceInfo) {
          segmentData.compliant++;
        }
      });

      return Array.from(segmentMap.entries())
        .map(([segment, data]) => ({
          segment,
          totalProducts: data.total,
          compliantProducts: data.compliant,
          complianceRate: data.total > 0 ? (data.compliant / data.total) * 100 : 0
        }))
        .sort((a, b) => b.complianceRate - a.complianceRate);
    } catch (error) {
      console.error('Error getting compliance by segment:', error);
      return [];
    }
  }
}