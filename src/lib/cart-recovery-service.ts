import { supabase } from '@/lib/supabase';
import { CartItem } from '@/types';

export interface CartRecoveryData {
  id: string;
  user_id: string;
  cart_items: CartItem[];
  abandoned_at: string;
  recovery_attempts: number;
  last_recovery_attempt: string | null;
  recovered_at: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
}

export class CartRecoveryService {
  /**
   * Identifies abandoned carts (carts inactive for more than 1 hour)
   */
  static async findAbandonedCarts(hoursThreshold: number = 1) {
    const { data, error } = await supabase
      .from('carts')
      .select(`
        id,
        user_id,
        updated_at,
        cart_items (*)
      `)
      .eq('status', 'active')
      .lt('updated_at', new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error finding abandoned carts:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Sends recovery email to users with abandoned carts
   */
  static async sendRecoveryEmail(userId: string, cartId: string) {
    try {
      // In a real implementation, this would call an email service
      // For now, we'll just record that an email was sent
      
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email, first_name')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user for cart recovery:', userError);
        return false;
      }

      // Log the email sending attempt
      console.log(`Sending cart recovery email to ${user.email} for cart ${cartId}`);

      // Update the cart recovery record
      const { error: updateError } = await supabase
        .from('cart_recovery')
        .upsert({
          cart_id: cartId,
          user_id: userId,
          email_sent: true,
          email_sent_at: new Date().toISOString(),
          recovery_attempts: 0
        }, { onConflict: 'cart_id' });

      if (updateError) {
        console.error('Error updating cart recovery record:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending cart recovery email:', error);
      return false;
    }
  }

  /**
   * Processes abandoned carts and sends recovery emails
   */
  static async processAbandonedCarts() {
    try {
      // Find carts abandoned for more than 1 hour
      const abandonedCarts = await this.findAbandonedCarts(1);

      let processedCount = 0;
      for (const cart of abandonedCarts) {
        // Check if we've already sent a recovery email for this cart
        const { data: recoveryRecord } = await supabase
          .from('cart_recovery')
          .select('id, email_sent')
          .eq('cart_id', cart.id)
          .single();

        if (!recoveryRecord || !recoveryRecord.email_sent) {
          const success = await this.sendRecoveryEmail(cart.user_id, cart.id);
          if (success) {
            processedCount++;
          }
        }
      }

      return {
        success: true,
        processedCount,
        totalAbandoned: abandonedCarts.length
      };
    } catch (error) {
      console.error('Error processing abandoned carts:', error);
      return {
        success: false,
        processedCount: 0,
        totalAbandoned: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Restores a cart from a recovery link
   */
  static async restoreCart(cartId: string, userId: string) {
    try {
      // Update the cart status to active
      const { error: updateError } = await supabase
        .from('carts')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', cartId)
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Update the recovery record
      const { error: recoveryUpdateError } = await supabase
        .from('cart_recovery')
        .update({
          recovered_at: new Date().toISOString()
        })
        .eq('cart_id', cartId);

      if (recoveryUpdateError) {
        console.error('Error updating recovery record:', recoveryUpdateError);
        // Don't throw here as the cart was restored successfully
      }

      return { success: true };
    } catch (error) {
      console.error('Error restoring cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Gets recovery statistics
   */
  static async getRecoveryStats() {
    try {
      // Total abandoned carts
      const { count: totalAbandoned } = await supabase
        .from('carts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lt('updated_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Abandoned for 1+ hour

      // Total recovery emails sent
      const { count: emailsSent } = await supabase
        .from('cart_recovery')
        .select('*', { count: 'exact', head: true })
        .not('email_sent_at', 'is', null);

      // Total recovered carts
      const { count: recovered } = await supabase
        .from('cart_recovery')
        .select('*', { count: 'exact', head: true })
        .not('recovered_at', 'is', null);

      return {
        totalAbandoned: totalAbandoned || 0,
        emailsSent: emailsSent || 0,
        recovered: recovered || 0,
        recoveryRate: totalAbandoned ? ((recovered || 0) / totalAbandoned) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting recovery stats:', error);
      return {
        totalAbandoned: 0,
        emailsSent: 0,
        recovered: 0,
        recoveryRate: 0
      };
    }
  }
}