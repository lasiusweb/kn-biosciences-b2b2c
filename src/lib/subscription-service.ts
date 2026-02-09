import { supabase } from '@/lib/supabase';
import { Product, ProductVariant } from '@/types';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: 'weekly' | 'bi-weekly' | 'monthly' | 'bi-monthly' | 'quarterly' | 'semi-annually' | 'annually';
  billing_interval: number; // Number of units (e.g., 1 for monthly, 3 for quarterly)
  trial_period_days?: number;
  features: string[];
  is_active: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'trialing';
  start_date: string;
  next_billing_date: string;
  end_date?: string;
  trial_end_date?: string;
  auto_renew: boolean;
  total_cycles?: number;
  cycles_completed: number;
  order_template: string; // ID of the order template to use for recurring orders
  created_at: string;
  updated_at: string;
  plan: SubscriptionPlan;
}

export interface SubscriptionOrder {
  id: string;
  subscription_id: string;
  order_id: string;
  billing_date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  amount: number;
  created_at: string;
}

export interface OrderTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  items: Array<{
    variant_id: string;
    quantity: number;
  }>;
  shipping_address_id: string;
  billing_address_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class SubscriptionService {
  /**
   * Gets all subscriptions for a user
   */
  static async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          user_id,
          plan_id,
          status,
          start_date,
          next_billing_date,
          end_date,
          trial_end_date,
          auto_renew,
          total_cycles,
          cycles_completed,
          order_template,
          created_at,
          updated_at,
          plans!inner (
            id,
            name,
            description,
            price,
            billing_cycle,
            billing_interval,
            trial_period_days,
            features,
            is_active
          )
        `)
        .eq('user_id', userId)
        .eq('plans.is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user subscriptions:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      return data.map(sub => ({
        ...sub,
        plan: sub.plans
      }));
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      return [];
    }
  }

  /**
   * Gets a specific subscription by ID
   */
  static async getSubscriptionById(subscriptionId: string, userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          user_id,
          plan_id,
          status,
          start_date,
          next_billing_date,
          end_date,
          trial_end_date,
          auto_renew,
          total_cycles,
          cycles_completed,
          order_template,
          created_at,
          updated_at,
          plans!inner (
            id,
            name,
            description,
            price,
            billing_cycle,
            billing_interval,
            trial_period_days,
            features,
            is_active
          )
        `)
        .eq('id', subscriptionId)
        .eq('user_id', userId)
        .eq('plans.is_active', true)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        ...data,
        plan: data.plans
      };
    } catch (error) {
      console.error('Error getting subscription by ID:', error);
      return null;
    }
  }

  /**
   * Creates a new subscription
   */
  static async createSubscription(
    userId: string,
    planId: string,
    orderTemplateId: string,
    autoRenew: boolean = true
  ): Promise<{ success: boolean; subscriptionId?: string; message: string }> {
    try {
      // Get the plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .eq('is_active', true)
        .single();

      if (planError || !plan) {
        return {
          success: false,
          message: 'Invalid or inactive subscription plan'
        };
      }

      // Get the order template
      const { data: template, error: templateError } = await supabase
        .from('order_templates')
        .select('*')
        .eq('id', orderTemplateId)
        .eq('user_id', userId)
        .single();

      if (templateError || !template) {
        return {
          success: false,
          message: 'Invalid order template'
        };
      }

      // Calculate dates
      const startDate = new Date().toISOString();
      const nextBillingDate = this.calculateNextBillingDate(
        new Date(startDate),
        plan.billing_cycle as any,
        plan.billing_interval
      );

      // Calculate trial end date if applicable
      let trialEndDate: string | undefined;
      if (plan.trial_period_days && plan.trial_period_days > 0) {
        const trialEnd = new Date(startDate);
        trialEnd.setDate(trialEnd.getDate() + plan.trial_period_days);
        trialEndDate = trialEnd.toISOString();
      }

      // Create the subscription
      const { data: newSubscription, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: trialEndDate ? 'trialing' : 'active',
          start_date: startDate,
          next_billing_date: nextBillingDate,
          trial_end_date: trialEndDate,
          auto_renew: autoRenew,
          cycles_completed: 0,
          order_template: orderTemplateId
        })
        .select()
        .single();

      if (subError) {
        console.error('Error creating subscription:', subError);
        return {
          success: false,
          message: 'Failed to create subscription'
        };
      }

      // Create the first scheduled order
      await this.createScheduledOrder(newSubscription.id, nextBillingDate, plan.price);

      return {
        success: true,
        subscriptionId: newSubscription.id,
        message: 'Subscription created successfully'
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        message: 'An error occurred while creating subscription'
      };
    }
  }

  /**
   * Cancels a subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    userId: string,
    immediate: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get current subscription
      const subscription = await this.getSubscriptionById(subscriptionId, userId);
      if (!subscription) {
        return {
          success: false,
          message: 'Subscription not found'
        };
      }

      // Update subscription status
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          end_date: immediate ? new Date().toISOString() : subscription.next_billing_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error cancelling subscription:', error);
        return {
          success: false,
          message: 'Failed to cancel subscription'
        };
      }

      // Cancel any future scheduled orders for this subscription
      await supabase
        .from('subscription_orders')
        .update({ status: 'cancelled' })
        .eq('subscription_id', subscriptionId)
        .gt('billing_date', new Date().toISOString());

      return {
        success: true,
        message: immediate 
          ? 'Subscription cancelled immediately' 
          : `Subscription will be cancelled after the current billing cycle ends on ${subscription.next_billing_date}`
      };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return {
        success: false,
        message: 'An error occurred while cancelling subscription'
      };
    }
  }

  /**
   * Pauses a subscription
   */
  static async pauseSubscription(subscriptionId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get current subscription
      const subscription = await this.getSubscriptionById(subscriptionId, userId);
      if (!subscription) {
        return {
          success: false,
          message: 'Subscription not found'
        };
      }

      // Update subscription status
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error pausing subscription:', error);
        return {
          success: false,
          message: 'Failed to pause subscription'
        };
      }

      return {
        success: true,
        message: 'Subscription paused successfully'
      };
    } catch (error) {
      console.error('Error pausing subscription:', error);
      return {
        success: false,
        message: 'An error occurred while pausing subscription'
      };
    }
  }

  /**
   * Resumes a paused subscription
   */
  static async resumeSubscription(subscriptionId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get current subscription
      const subscription = await this.getSubscriptionById(subscriptionId, userId);
      if (!subscription) {
        return {
          success: false,
          message: 'Subscription not found'
        };
      }

      // Calculate next billing date from now
      const nextBillingDate = this.calculateNextBillingDate(
        new Date(),
        subscription.plan.billing_cycle as any,
        subscription.plan.billing_interval
      );

      // Update subscription status
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          next_billing_date: nextBillingDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error resuming subscription:', error);
        return {
          success: false,
          message: 'Failed to resume subscription'
        };
      }

      // Create a new scheduled order
      await this.createScheduledOrder(subscriptionId, nextBillingDate, subscription.plan.price);

      return {
        success: true,
        message: 'Subscription resumed successfully'
      };
    } catch (error) {
      console.error('Error resuming subscription:', error);
      return {
        success: false,
        message: 'An error occurred while resuming subscription'
      };
    }
  }

  /**
   * Updates subscription auto-renew setting
   */
  static async updateAutoRenew(
    subscriptionId: string,
    userId: string,
    autoRenew: boolean
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          auto_renew: autoRenew,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating auto renew:', error);
        return {
          success: false,
          message: 'Failed to update auto renew setting'
        };
      }

      return {
        success: true,
        message: `Auto renew ${autoRenew ? 'enabled' : 'disabled'} successfully`
      };
    } catch (error) {
      console.error('Error updating auto renew:', error);
      return {
        success: false,
        message: 'An error occurred while updating auto renew setting'
      };
    }
  }

  /**
   * Gets available subscription plans
   */
  static async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching subscription plans:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting subscription plans:', error);
      return [];
    }
  }

  /**
   * Creates an order template for subscriptions
   */
  static async createOrderTemplate(
    userId: string,
    name: string,
    items: Array<{ variant_id: string; quantity: number }>,
    shippingAddressId: string,
    billingAddressId: string,
    description?: string
  ): Promise<{ success: boolean; templateId?: string; message: string }> {
    try {
      const { data, error } = await supabase
        .from('order_templates')
        .insert({
          user_id: userId,
          name,
          description: description || null,
          items,
          shipping_address_id: shippingAddressId,
          billing_address_id: billingAddressId
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating order template:', error);
        return {
          success: false,
          message: 'Failed to create order template'
        };
      }

      return {
        success: true,
        templateId: data.id,
        message: 'Order template created successfully'
      };
    } catch (error) {
      console.error('Error creating order template:', error);
      return {
        success: false,
        message: 'An error occurred while creating order template'
      };
    }
  }

  /**
   * Gets user's order templates
   */
  static async getOrderTemplates(userId: string): Promise<OrderTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('order_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching order templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting order templates:', error);
      return [];
    }
  }

  /**
   * Gets subscription orders history
   */
  static async getSubscriptionOrdersHistory(subscriptionId: string, userId: string): Promise<SubscriptionOrder[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_orders')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('billing_date', { ascending: false });

      if (error) {
        console.error('Error fetching subscription orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting subscription orders history:', error);
      return [];
    }
  }

  /**
   * Calculates the next billing date based on the cycle
   */
  private static calculateNextBillingDate(
    startDate: Date,
    cycle: 'weekly' | 'bi-weekly' | 'monthly' | 'bi-monthly' | 'quarterly' | 'semi-annually' | 'annually',
    interval: number
  ): string {
    const nextDate = new Date(startDate);

    switch (cycle) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7 * interval);
        break;
      case 'bi-weekly':
        nextDate.setDate(nextDate.getDate() + 14 * interval);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      case 'bi-monthly':
        nextDate.setMonth(nextDate.getMonth() + 2 * interval);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3 * interval);
        break;
      case 'semi-annually':
        nextDate.setMonth(nextDate.getMonth() + 6 * interval);
        break;
      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
    }

    return nextDate.toISOString();
  }

  /**
   * Creates a scheduled order for a subscription
   */
  private static async createScheduledOrder(
    subscriptionId: string,
    billingDate: string,
    amount: number
  ): Promise<void> {
    try {
      await supabase
        .from('subscription_orders')
        .insert({
          subscription_id: subscriptionId,
          billing_date: billingDate,
          status: 'pending',
          amount
        });
    } catch (error) {
      console.error('Error creating scheduled order:', error);
    }
  }

  /**
   * Processes scheduled subscriptions (typically called by a cron job)
   */
  static async processScheduledSubscriptions(): Promise<void> {
    try {
      // Get all subscriptions that are due for billing today
      const { data: dueSubscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select(`
          id,
          user_id,
          plan_id,
          status,
          next_billing_date,
          auto_renew,
          cycles_completed,
          order_template,
          plans!inner (
            id,
            name,
            price,
            billing_cycle,
            billing_interval,
            is_active
          )
        `)
        .eq('status', 'active')
        .eq('plans.is_active', true)
        .lte('next_billing_date', new Date().toISOString())
        .order('next_billing_date', { ascending: true });

      if (subsError) {
        console.error('Error fetching due subscriptions:', subsError);
        return;
      }

      if (!dueSubscriptions || dueSubscriptions.length === 0) {
        return;
      }

      // Process each due subscription
      for (const subscription of dueSubscriptions) {
        try {
          // Create an order from the template
          await this.processSubscriptionOrder(subscription);
          
          // Update subscription with next billing date
          const nextBillingDate = this.calculateNextBillingDate(
            new Date(subscription.next_billing_date),
            subscription.plans.billing_cycle as any,
            subscription.plans.billing_interval
          );

          // Update the subscription
          await supabase
            .from('subscriptions')
            .update({
              next_billing_date: nextBillingDate,
              cycles_completed: subscription.cycles_completed + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id);

          // Create the next scheduled order
          await this.createScheduledOrder(subscription.id, nextBillingDate, subscription.plans.price);
        } catch (error) {
          console.error(`Error processing subscription ${subscription.id}:`, error);
          
          // Update subscription status to indicate issue
          await supabase
            .from('subscriptions')
            .update({
              status: 'paused',
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id);
        }
      }
    } catch (error) {
      console.error('Error processing scheduled subscriptions:', error);
    }
  }

  /**
   * Processes a single subscription order
   */
  private static async processSubscriptionOrder(subscription: Subscription): Promise<void> {
    try {
      // Get the order template
      const { data: template, error: templateError } = await supabase
        .from('order_templates')
        .select('*')
        .eq('id', subscription.order_template)
        .single();

      if (templateError || !template) {
        throw new Error(`Order template ${subscription.order_template} not found`);
      }

      // Get user's address information
      const { data: shippingAddress, error: shipAddrError } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', template.shipping_address_id)
        .single();

      const { data: billingAddress, error: billAddrError } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', template.billing_address_id)
        .single();

      if (shipAddrError || billAddrError) {
        throw new Error('Shipping or billing address not found');
      }

      // Create a new order based on the template
      const orderNumber = `SUB-${subscription.id.substring(0, 8).toUpperCase()}-${Date.now()}`;
      
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: subscription.user_id,
          status: 'processing',
          payment_status: 'pending',
          payment_method: 'subscription',
          currency: 'INR',
          subtotal: subscription.plan.price,
          tax_amount: subscription.plan.price * 0.18, // 18% tax
          shipping_amount: 0, // Could be calculated based on shipping address
          discount_amount: 0,
          total_amount: subscription.plan.price * 1.18, // Including tax
          shipping_address: shippingAddress,
          billing_address: billingAddress,
          notes: `Order for subscription ${subscription.id}`,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (orderError) {
        throw orderError;
      }

      // Add items to the order
      for (const item of template.items) {
        // Get product variant details
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select(`
            id,
            product_id,
            sku,
            price,
            products!inner (
              id,
              name
            )
          `)
          .eq('id', item.variant_id)
          .single();

        if (variantError || !variant) {
          console.error(`Variant ${item.variant_id} not found, skipping item`);
          continue;
        }

        // Add item to order
        await supabase
          .from('order_items')
          .insert({
            order_id: newOrder.id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: variant.price,
            total_price: variant.price * item.quantity
          });
      }

      // Create a record in subscription_orders
      await supabase
        .from('subscription_orders')
        .insert({
          subscription_id: subscription.id,
          order_id: newOrder.id,
          billing_date: subscription.next_billing_date,
          status: 'processing',
          amount: subscription.plan.price
        });
    } catch (error) {
      console.error('Error processing subscription order:', error);
      throw error;
    }
  }

  /**
   * Updates a subscription to a different plan
   */
  static async updateSubscriptionPlan(
    subscriptionId: string,
    userId: string,
    newPlanId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify subscription belongs to user
      const subscription = await this.getSubscriptionById(subscriptionId, userId);
      if (!subscription) {
        return {
          success: false,
          message: 'Subscription not found or does not belong to user'
        };
      }

      // Get new plan details
      const { data: newPlan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', newPlanId)
        .eq('is_active', true)
        .single();

      if (planError || !newPlan) {
        return {
          success: false,
          message: 'Invalid or inactive subscription plan'
        };
      }

      // Calculate new next billing date based on new plan cycle
      const nextBillingDate = this.calculateNextBillingDate(
        new Date(subscription.next_billing_date),
        newPlan.billing_cycle as any,
        newPlan.billing_interval
      );

      // Update subscription
      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan_id: newPlanId,
          next_billing_date: nextBillingDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating subscription plan:', error);
        return {
          success: false,
          message: 'Failed to update subscription plan'
        };
      }

      return {
        success: true,
        message: 'Subscription plan updated successfully'
      };
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      return {
        success: false,
        message: 'An error occurred while updating subscription plan'
      };
    }
  }
}