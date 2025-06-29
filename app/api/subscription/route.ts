import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { stripeService } from '@/utils/stripeService';
import { configService } from '@/utils/configService';

const prisma = new PrismaClient();

// GET /api/subscription - Get current subscription status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionId: true,
        customerId: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        monthlyPoints: true,
        pointsUsed: true,
        pointsEarned: true,
        pointsResetDate: true,
      },
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // Get subscription configuration
    const tierConfig = await configService.getSubscriptionTier(developer.subscriptionTier);

    // Get Stripe subscription details if exists
    let stripeSubscription = null;
    if (developer.subscriptionId) {
      stripeSubscription = await stripeService.getSubscription(developer.subscriptionId);
    }

    const response = {
      tier: developer.subscriptionTier,
      status: developer.subscriptionStatus,
      config: tierConfig,
      points: {
        monthly: developer.monthlyPoints,
        used: developer.pointsUsed,
        earned: developer.pointsEarned,
        available: developer.monthlyPoints + developer.pointsEarned - developer.pointsUsed,
        resetDate: developer.pointsResetDate,
      },
      billing: stripeSubscription ? {
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        status: stripeSubscription.status,
      } : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Subscription GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/subscription - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier, priceId } = await request.json();
    
    if (!tier || !priceId) {
      return NextResponse.json({ error: 'Missing tier or priceId' }, { status: 400 });
    }

    const validTiers = ['BASIC', 'STARTER', 'PRO', 'EXPERT'];
    if (!validTiers.includes(tier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }

    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // Create or get Stripe customer
    let customerId = developer.customerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer({
        email: session.user.email,
        name: developer.name,
        developerId: developer.id,
      });
      customerId = customer.id;

      // Update developer with customer ID
      await prisma.developer.update({
        where: { id: developer.id },
        data: { customerId },
      });
    }

    // Create subscription
    const subscription = await stripeService.createSubscription({
      customerId,
      priceId,
      tier,
    });

    // Get tier configuration
    const tierConfig = await configService.getSubscriptionTier(tier);

    // Update developer subscription info
    await prisma.developer.update({
      where: { id: developer.id },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: 'pending',
        subscriptionId: subscription.id,
        customerId,
        subscriptionStart: new Date(),
        monthlyPoints: tierConfig.monthlyPoints,
        pointsUsed: 0,
        pointsEarned: 0,
        pointsResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Return client secret for payment confirmation
    const clientSecret = (subscription.latest_invoice as any)?.payment_intent?.client_secret;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Subscription POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/subscription - Update subscription
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, tier, priceId } = await request.json();
    
    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
    });

    if (!developer || !developer.subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    let result;
    
    switch (action) {
      case 'cancel':
        result = await stripeService.cancelSubscription(developer.subscriptionId);
        await prisma.developer.update({
          where: { id: developer.id },
          data: { subscriptionStatus: 'cancelled' },
        });
        break;
        
      case 'upgrade':
      case 'downgrade':
        if (!tier || !priceId) {
          return NextResponse.json({ error: 'Missing tier or priceId for upgrade/downgrade' }, { status: 400 });
        }
        
        result = await stripeService.updateSubscription(developer.subscriptionId, {
          items: [{
            id: (await stripeService.getSubscription(developer.subscriptionId))?.items.data[0].id,
            price: priceId,
          }],
          metadata: { tier },
        });
        
        const tierConfig = await configService.getSubscriptionTier(tier);
        await prisma.developer.update({
          where: { id: developer.id },
          data: {
            subscriptionTier: tier,
            monthlyPoints: tierConfig.monthlyPoints,
          },
        });
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, subscription: result });
  } catch (error) {
    console.error('Subscription PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}