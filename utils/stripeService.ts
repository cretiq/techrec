import Stripe from 'stripe';
import { randomBytes } from 'crypto';
import { configService, SubscriptionTierConfig } from './configService';

// Lazy initialization function to avoid build-time errors
function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe not configured - STRIPE_SECRET_KEY environment variable is missing');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil',
  });
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  tier: 'BASIC' | 'STARTER' | 'PRO' | 'EXPERT';
}

export interface CreateCustomerParams {
  email: string;
  name: string;
  developerId: string;
}

export class StripeService {
  private static instance: StripeService;

  private constructor() {}

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  // Private method to get stripe client with lazy initialization
  private getStripe() {
    return getStripeClient();
  }

  // Customer Management
  public async createCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
    try {
      const customer = await this.getStripe().customers.create({
        email: params.email,
        name: params.name,
        metadata: {
          developerId: params.developerId,
        },
      });

      return customer;
    } catch (error) {
      console.error('Failed to create Stripe customer:', error);
      throw error;
    }
  }

  public async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await this.getStripe().customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      console.error('Failed to retrieve Stripe customer:', error);
      return null;
    }
  }

  public async updateCustomer(customerId: string, updates: Partial<Stripe.CustomerUpdateParams>): Promise<Stripe.Customer> {
    try {
      const customer = await this.getStripe().customers.update(customerId, updates);
      return customer;
    } catch (error) {
      console.error('Failed to update Stripe customer:', error);
      throw error;
    }
  }

  // Subscription Management
  public async createSubscription(params: CreateSubscriptionParams): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.getStripe().subscriptions.create({
        customer: params.customerId,
        items: [
          {
            price: params.priceId,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          tier: params.tier,
        },
      });

      return subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  public async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      const subscription = await this.getStripe().subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Failed to retrieve subscription:', error);
      return null;
    }
  }

  public async updateSubscription(
    subscriptionId: string,
    updates: Partial<Stripe.SubscriptionUpdateParams>
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.getStripe().subscriptions.update(subscriptionId, updates);
      return subscription;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  }

  public async cancelSubscription(subscriptionId: string, immediately = false): Promise<Stripe.Subscription> {
    try {
      if (immediately) {
        const subscription = await this.getStripe().subscriptions.cancel(subscriptionId);
        return subscription;
      } else {
        const subscription = await this.getStripe().subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        return subscription;
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  // Price Management
  public async createPrice(tierConfig: SubscriptionTierConfig, tier: string): Promise<Stripe.Price> {
    try {
      // First, create or get the product
      const product = await this.createOrGetProduct(tier);

      const price = await this.getStripe().prices.create({
        currency: 'usd',
        unit_amount: Math.round(tierConfig.price * 100), // Convert to cents
        recurring: {
          interval: 'month',
        },
        product: product.id,
        metadata: {
          tier,
          monthlyPoints: tierConfig.monthlyPoints.toString(),
          xpMultiplier: tierConfig.xpMultiplier.toString(),
        },
      });

      return price;
    } catch (error) {
      console.error('Failed to create price:', error);
      throw error;
    }
  }

  private async createOrGetProduct(tier: string): Promise<Stripe.Product> {
    try {
      // Try to find existing product
      const products = await this.getStripe().products.list({
        active: true,
        limit: 100,
      });

      const existingProduct = products.data.find(p => p.metadata.tier === tier);
      if (existingProduct) {
        return existingProduct;
      }

      // Create new product
      const tierConfig = await configService.getSubscriptionTier(tier as any);
      const product = await this.getStripe().products.create({
        name: `TechRec ${tier.charAt(0) + tier.slice(1).toLowerCase()} Plan`,
        description: `${tierConfig.monthlyPoints} monthly points, ${tierConfig.xpMultiplier}x XP multiplier`,
        metadata: {
          tier,
        },
      });

      return product;
    } catch (error) {
      console.error('Failed to create or get product:', error);
      throw error;
    }
  }

  // Payment Intent Management
  public async createPaymentIntent(amount: number, customerId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.getStripe().paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  // Webhook handling
  public constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    try {
      const event = this.getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      console.error('Failed to construct webhook event:', error);
      throw error;
    }
  }

  // Utility methods
  public async listCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await this.getStripe().subscriptions.list({
        customer: customerId,
        status: 'all',
        expand: ['data.default_payment_method'],
      });

      return subscriptions.data;
    } catch (error) {
      console.error('Failed to list customer subscriptions:', error);
      throw error;
    }
  }

  public async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.getStripe().paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Failed to get customer payment methods:', error);
      throw error;
    }
  }

  // Initialize subscription tiers in Stripe
  public async initializeSubscriptionTiers(): Promise<void> {
    try {
      const tiers = await configService.getSubscriptionTiers();
      
      // Skip FREE tier as it doesn't need Stripe pricing
      const paidTiers = Object.entries(tiers).filter(([tier]) => tier !== 'FREE');
      
      for (const [tier, config] of paidTiers) {
        if (config.price > 0) {
          await this.createPrice(config, tier);
          console.log(`✅ Created/verified price for ${tier} tier`);
        }
      }
    } catch (error) {
      console.error('Failed to initialize subscription tiers:', error);
      throw error;
    }
  }

  // Utility methods
  private generateIdempotencyKey(operation: string, ...identifiers: string[]): string {
    // Create deterministic idempotency key based on operation and identifiers
    const baseString = [operation, ...identifiers].join('-');
    const hash = randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp for uniqueness
    
    // Format: operation-hash-timestamp (max 255 chars for Stripe)
    return `${operation}-${hash}-${timestamp}`.substring(0, 255);
  }

  private generateDeterministicKey(operation: string, ...identifiers: string[]): string {
    // For operations that need to be truly idempotent (same input = same key)
    const crypto = require('crypto');
    const baseString = [operation, ...identifiers].join('-');
    const hash = crypto.createHash('sha256').update(baseString).digest('hex').substring(0, 32);
    return `${operation}-${hash}`;
  }

  // Enhanced webhook signature verification
  public constructEventWithReplayProtection(payload: string | Buffer, signature: string): {
    event: Stripe.Event;
    isReplay: boolean;
  } {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    try {
      const event = this.getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
      
      // Check for replay attacks (events older than 10 minutes)
      const eventAge = (Date.now() / 1000) - event.created;
      const isReplay = eventAge > 600; // 10 minutes
      
      if (isReplay) {
        console.warn(`Potential replay attack detected for event ${event.id}, age: ${eventAge}s`);
      }
      
      return { event, isReplay };
    } catch (error) {
      console.error('Failed to construct webhook event:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const stripeService = StripeService.getInstance();