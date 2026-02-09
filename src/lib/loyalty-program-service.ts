import { supabase } from '@/lib/supabase';

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  points_per_rupee: number; // How many points earned per rupee spent
  points_expiry_days: number;
  minimum_points_to_redeem: number;
  redemption_value_per_point: number; // Value of each point in rupees
  bonus_point_events: BonusPointEvent[];
  created_at: string;
  updated_at: string;
}

export interface BonusPointEvent {
  id: string;
  name: string;
  description: string;
  points: number;
  conditions: Record<string, any>; // Conditions for earning bonus points
  is_active: boolean;
}

export interface UserLoyaltyProfile {
  id: string;
  user_id: string;
  program_id: string;
  points_balance: number;
  tier: string;
  tier_points: number;
  total_points_earned: number;
  total_points_redeemed: number;
  last_activity_date: string;
  enrolled_at: string;
  next_tier_progress?: {
    tier: string;
    points_needed: number;
    progress_percentage: number;
  };
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  program_id: string;
  transaction_type: 'earn' | 'redeem' | 'bonus' | 'expiry';
  points: number;
  balance_after: number;
  reference_id?: string; // Order ID or other reference
  description: string;
  created_at: string;
}

export interface Tier {
  id: string;
  name: string;
  min_points: number;
  benefits: string[];
  discount_percentage: number;
  bonus_multiplier: number; // Multiplier for points earned
}

export class LoyaltyProgramService {
  /**
   * Gets the active loyalty program
   */
  static async getActiveProgram(): Promise<LoyaltyProgram | null> {
    try {
      const { data, error } = await supabase
        .from('loyalty_programs')
        .select(`
          id,
          name,
          description,
          is_active,
          points_per_rupee,
          points_expiry_days,
          minimum_points_to_redeem,
          redemption_value_per_point,
          created_at,
          updated_at,
          bonus_events (
            id,
            name,
            description,
            points,
            conditions,
            is_active
          )
        `)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching active loyalty program:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        ...data,
        bonus_point_events: data.bonus_events || []
      };
    } catch (error) {
      console.error('Error getting active loyalty program:', error);
      return null;
    }
  }

  /**
   * Gets a user's loyalty profile
   */
  static async getUserLoyaltyProfile(userId: string): Promise<UserLoyaltyProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_loyalty_profiles')
        .select(`
          id,
          user_id,
          program_id,
          points_balance,
          tier,
          tier_points,
          total_points_earned,
          total_points_redeemed,
          last_activity_date,
          enrolled_at,
          loyalty_programs!inner (
            id,
            name,
            points_per_rupee,
            minimum_points_to_redeem,
            redemption_value_per_point
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user loyalty profile:', error);
        return null;
      }

      if (!data) {
        // User not enrolled, return null
        return null;
      }

      // Calculate next tier progress if needed
      const nextTierProgress = await this.calculateNextTierProgress(data);

      return {
        ...data,
        next_tier_progress: nextTierProgress
      };
    } catch (error) {
      console.error('Error getting user loyalty profile:', error);
      return null;
    }
  }

  /**
   * Enrolls a user in the loyalty program
   */
  static async enrollUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user is already enrolled
      const existingProfile = await this.getUserLoyaltyProfile(userId);
      if (existingProfile) {
        return {
          success: false,
          message: 'User is already enrolled in the loyalty program'
        };
      }

      // Get active program
      const activeProgram = await this.getActiveProgram();
      if (!activeProgram) {
        return {
          success: false,
          message: 'No active loyalty program available'
        };
      }

      // Create user profile
      const { error } = await supabase
        .from('user_loyalty_profiles')
        .insert({
          user_id: userId,
          program_id: activeProgram.id,
          points_balance: 0,
          tier: 'bronze', // Default tier
          tier_points: 0,
          total_points_earned: 0,
          total_points_redeemed: 0,
          last_activity_date: new Date().toISOString(),
          enrolled_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error enrolling user in loyalty program:', error);
        return {
          success: false,
          message: 'Failed to enroll in loyalty program'
        };
      }

      // Log enrollment activity
      await this.logLoyaltyActivity(userId, activeProgram.id, 'enrollment', 0, 'User enrolled in loyalty program');

      return {
        success: true,
        message: 'Successfully enrolled in loyalty program'
      };
    } catch (error) {
      console.error('Error enrolling user in loyalty program:', error);
      return {
        success: false,
        message: 'An error occurred during enrollment'
      };
    }
  }

  /**
   * Calculates points earned for a purchase
   */
  static async calculatePointsForPurchase(userId: string, purchaseAmount: number): Promise<number> {
    const program = await this.getActiveProgram();
    if (!program) {
      return 0;
    }

    // Base points calculation
    let points = purchaseAmount * program.points_per_rupee;

    // Check for bonus events that apply to this user
    const applicableBonuses = await this.getApplicableBonusEvents(userId, 'purchase');
    
    for (const bonus of applicableBonuses) {
      if (bonus.conditions?.min_amount && purchaseAmount >= bonus.conditions.min_amount) {
        points += bonus.points;
      }
    }

    return Math.floor(points);
  }

  /**
   * Awards points to a user for a purchase
   */
  static async awardPointsForPurchase(
    userId: string,
    orderId: string,
    purchaseAmount: number
  ): Promise<{ success: boolean; pointsEarned: number; message: string }> {
    try {
      const program = await this.getActiveProgram();
      if (!program) {
        return {
          success: false,
          pointsEarned: 0,
          message: 'No active loyalty program'
        };
      }

      // Calculate points to award
      const pointsToAward = await this.calculatePointsForPurchase(userId, purchaseAmount);

      if (pointsToAward <= 0) {
        return {
          success: true,
          pointsEarned: 0,
          message: 'No points awarded for this purchase'
        };
      }

      // Update user's points
      const { data: profile, error } = await supabase
        .from('user_loyalty_profiles')
        .update({
          points_balance: this.points_balance + pointsToAward,
          tier_points: this.tier_points + pointsToAward,
          total_points_earned: this.total_points_earned + pointsToAward,
          last_activity_date: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user points:', error);
        return {
          success: false,
          pointsEarned: 0,
          message: 'Failed to award points'
        };
      }

      // Record the transaction
      await this.recordLoyaltyTransaction(
        userId,
        program.id,
        'earn',
        pointsToAward,
        profile.points_balance,
        orderId,
        `Points earned from purchase #${orderId}`
      );

      // Check if user qualifies for a new tier
      await this.checkForTierUpgrade(userId);

      return {
        success: true,
        pointsEarned,
        message: `Successfully earned ${pointsToAward} loyalty points`
      };
    } catch (error) {
      console.error('Error awarding points for purchase:', error);
      return {
        success: false,
        pointsEarned: 0,
        message: 'An error occurred while awarding points'
      };
    }
  }

  /**
   * Redeems points for rewards/discounts
   */
  static async redeemPoints(
    userId: string,
    pointsToRedeem: number,
    redemptionType: 'discount' | 'reward_item' | 'gift_card',
    referenceId?: string
  ): Promise<{ success: boolean; message: string; discountAmount?: number }> {
    try {
      const profile = await this.getUserLoyaltyProfile(userId);
      if (!profile) {
        return {
          success: false,
          message: 'User not enrolled in loyalty program'
        };
      }

      if (pointsToRedeem > profile.points_balance) {
        return {
          success: false,
          message: 'Insufficient points for redemption'
        };
      }

      const program = await this.getActiveProgram();
      if (!program) {
        return {
          success: false,
          message: 'No active loyalty program'
        };
      }

      if (pointsToRedeem < program.minimum_points_to_redeem) {
        return {
          success: false,
          message: `Minimum ${program.minimum_points_to_redeem} points required for redemption`
        };
      }

      // Calculate redemption value
      const redemptionValue = pointsToRedeem * program.redemption_value_per_point;

      // Update user's points
      const { error } = await supabase
        .from('user_loyalty_profiles')
        .update({
          points_balance: this.points_balance - pointsToRedeem,
          total_points_redeemed: this.total_points_redeemed + pointsToRedeem,
          last_activity_date: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user points for redemption:', error);
        return {
          success: false,
          message: 'Failed to process redemption'
        };
      }

      // Record the transaction
      await this.recordLoyaltyTransaction(
        userId,
        program.id,
        'redeem',
        -pointsToRedeem,
        profile.points_balance - pointsToRedeem,
        referenceId,
        `Points redeemed for ${redemptionType}`
      );

      return {
        success: true,
        message: `Successfully redeemed ${pointsToRedeem} points for ₹${redemptionValue.toFixed(2)} discount`,
        discountAmount: redemptionValue
      };
    } catch (error) {
      console.error('Error redeeming points:', error);
      return {
        success: false,
        message: 'An error occurred during redemption'
      };
    }
  }

  /**
   * Gets user's loyalty transaction history
   */
  static async getTransactionHistory(userId: string, limit: number = 10): Promise<LoyaltyTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching loyalty transaction history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  /**
   * Gets applicable bonus events for a user
   */
  private static async getApplicableBonusEvents(userId: string, eventType: string): Promise<BonusPointEvent[]> {
    try {
      const program = await this.getActiveProgram();
      if (!program) {
        return [];
      }

      // In a real implementation, this would check conditions like:
      // - Is it the user's birthday?
      // - Is it a special occasion?
      // - Has the user reached a milestone?
      // For now, we'll return active bonus events that match the event type
      
      return program.bonus_point_events?.filter(event => 
        event.is_active && 
        (!event.conditions?.event_type || event.conditions.event_type === eventType)
      ) || [];
    } catch (error) {
      console.error('Error getting applicable bonus events:', error);
      return [];
    }
  }

  /**
   * Checks if user qualifies for a tier upgrade
   */
  private static async checkForTierUpgrade(userId: string): Promise<void> {
    try {
      const profile = await this.getUserLoyaltyProfile(userId);
      if (!profile) return;

      const tiers = await this.getTiers();
      if (tiers.length === 0) return;

      // Find the highest tier the user qualifies for
      const qualifiedTier = [...tiers]
        .sort((a, b) => b.min_points - a.min_points) // Sort by min_points descending
        .find(tier => profile.tier_points >= tier.min_points);

      if (qualifiedTier && qualifiedTier.name !== profile.tier) {
        // Update user's tier
        await supabase
          .from('user_loyalty_profiles')
          .update({
            tier: qualifiedTier.name,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        // Log tier upgrade
        await this.logLoyaltyActivity(
          userId,
          profile.program_id,
          'tier_upgrade',
          0,
          `Upgraded to ${qualifiedTier.name} tier`
        );
      }
    } catch (error) {
      console.error('Error checking for tier upgrade:', error);
    }
  }

  /**
   * Gets loyalty program tiers
   */
  private static async getTiers(): Promise<Tier[]> {
    try {
      const { data, error } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .order('min_points', { ascending: true });

      if (error) {
        console.error('Error fetching loyalty tiers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting loyalty tiers:', error);
      return [];
    }
  }

  /**
   * Calculates progress to next tier
   */
  private static async calculateNextTierProgress(profile: UserLoyaltyProfile): Promise<UserLoyaltyProfile['next_tier_progress'] | undefined> {
    const tiers = await this.getTiers();
    if (tiers.length === 0) return undefined;

    // Find current tier index
    const currentTierIndex = tiers.findIndex(tier => tier.name === profile.tier);
    if (currentTierIndex === -1 || currentTierIndex === tiers.length - 1) {
      // Either current tier not found or user is at the highest tier
      return undefined;
    }

    const nextTier = tiers[currentTierIndex + 1];
    const pointsNeeded = nextTier.min_points - profile.tier_points;
    const progressPercentage = Math.min(100, (profile.tier_points / nextTier.min_points) * 100);

    return {
      tier: nextTier.name,
      points_needed: pointsNeeded,
      progress_percentage: progressPercentage
    };
  }

  /**
   * Records a loyalty activity
   */
  private static async logLoyaltyActivity(
    userId: string,
    programId: string,
    activityType: string,
    points: number,
    description: string
  ): Promise<void> {
    try {
      await supabase
        .from('loyalty_activities')
        .insert({
          user_id: userId,
          program_id: programId,
          activity_type: activityType,
          points_impact: points,
          description,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging loyalty activity:', error);
    }
  }

  /**
   * Records a loyalty transaction
   */
  private static async recordLoyaltyTransaction(
    userId: string,
    programId: string,
    transactionType: 'earn' | 'redeem' | 'bonus' | 'expiry',
    points: number,
    balanceAfter: number,
    referenceId?: string,
    description: string
  ): Promise<void> {
    try {
      await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: userId,
          program_id: programId,
          transaction_type: transactionType,
          points,
          balance_after: balanceAfter,
          reference_id: referenceId,
          description,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording loyalty transaction:', error);
    }
  }

  /**
   * Gets user's available rewards
   */
  static async getAvailableRewards(userId: string): Promise<Array<{
    id: string;
    name: string;
    description: string;
    points_cost: number;
    image?: string;
    category: string;
    is_available: boolean;
  }>> {
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_cost', { ascending: true });

      if (error) {
        console.error('Error fetching available rewards:', error);
        return [];
      }

      const profile = await this.getUserLoyaltyProfile(userId);
      const userPoints = profile?.points_balance || 0;

      return (data || []).map(reward => ({
        ...reward,
        is_available: reward.points_cost <= userPoints
      }));
    } catch (error) {
      console.error('Error getting available rewards:', error);
      return [];
    }
  }

  /**
   * Gets loyalty program statistics for a user
   */
  static async getUserLoyaltyStats(userId: string): Promise<{
    total_earned: number;
    total_redeemed: number;
    available_balance: number;
    next_reward_progress?: {
      reward_name: string;
      points_needed: number;
      progress_percentage: number;
    };
  } | null> {
    try {
      const profile = await this.getUserLoyaltyProfile(userId);
      if (!profile) {
        return null;
      }

      // Find the next achievable reward
      const availableRewards = await this.getAvailableRewards(userId);
      const nextReward = availableRewards
        .filter(reward => reward.points_cost > profile.points_balance)
        .sort((a, b) => a.points_cost - b.points_cost)[0];

      let nextRewardProgress;
      if (nextReward) {
        const pointsNeeded = nextReward.points_cost - profile.points_balance;
        const progressPercentage = (profile.points_balance / nextReward.points_cost) * 100;
        
        nextRewardProgress = {
          reward_name: nextReward.name,
          points_needed,
          progress_percentage: Math.min(100, progressPercentage)
        };
      }

      return {
        total_earned: profile.total_points_earned,
        total_redeemed: profile.total_points_redeemed,
        available_balance: profile.points_balance,
        next_reward_progress
      };
    } catch (error) {
      console.error('Error getting user loyalty stats:', error);
      return null;
    }
  }
}