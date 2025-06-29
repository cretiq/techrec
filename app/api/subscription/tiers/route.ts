import { NextRequest, NextResponse } from 'next/server';
import { configService } from '@/utils/configService';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// GET /api/subscription/tiers - Get all subscription tiers with pricing
export async function GET(request: NextRequest) {
  try {
    // Get tier configurations
    const tiers = await configService.getSubscriptionTiers();
    
    // Get Stripe prices for paid tiers
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      expand: ['data.product'],
    });

    // Build response with tier info and Stripe price IDs
    const tiersWithPricing = Object.entries(tiers).map(([tierName, config]) => {
      let priceId = null;
      
      // Find matching Stripe price
      if (tierName !== 'FREE') {
        const stripePrice = prices.data.find(price => 
          price.metadata.tier === tierName
        );
        priceId = stripePrice?.id || null;
      }

      return {
        tier: tierName,
        name: `${tierName.charAt(0)}${tierName.slice(1).toLowerCase()}`,
        price: config.price,
        monthlyPoints: config.monthlyPoints,
        xpMultiplier: config.xpMultiplier,
        features: config.features,
        priceId,
        popular: tierName === 'PRO', // Mark PRO as popular
        recommended: tierName === 'STARTER', // Mark STARTER as recommended for new users
      };
    });

    // Sort tiers by price
    tiersWithPricing.sort((a, b) => a.price - b.price);

    return NextResponse.json({
      tiers: tiersWithPricing,
      currency: 'USD',
    });
  } catch (error) {
    console.error('Tiers GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}