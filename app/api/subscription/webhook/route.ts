import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { stripeService } from '@/utils/stripeService';
import { configService } from '@/utils/configService';
import Stripe from 'stripe';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  try {
    const { event, isReplay } = stripeService.constructEventWithReplayProtection(body, signature);
    
    // Reject replay attacks
    if (isReplay) {
      console.warn(`Rejecting replay attack for event ${event.id}`);
      return NextResponse.json({ error: 'Event too old' }, { status: 400 });
    }

    // Check if we've already processed this event (idempotency)
    const existingWebhook = await prisma.webhookEvent?.findUnique({
      where: { eventId: event.id },
    }).catch(() => null); // Ignore if table doesn't exist yet

    if (existingWebhook) {
      console.log(`Event ${event.id} already processed, returning success`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Record webhook event for idempotency (if table exists)
    try {
      await prisma.webhookEvent?.create({
        data: {
          eventId: event.id,
          eventType: event.type,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      // Ignore if webhook table doesn't exist yet
      console.log('Webhook event table not found, proceeding without idempotency record');
    }

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const tier = subscription.metadata.tier as string;
    
    // Find developer by customer ID
    const developer = await prisma.developer.findFirst({
      where: { customerId },
    });

    if (!developer) {
      console.error('Developer not found for customer:', customerId);
      return;
    }

    const tierConfig = await configService.getSubscriptionTier(tier as any);

    await prisma.developer.update({
      where: { id: developer.id },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: subscription.status,
        subscriptionId: subscription.id,
        subscriptionStart: new Date(subscription.current_period_start * 1000),
        subscriptionEnd: new Date(subscription.current_period_end * 1000),
        monthlyPoints: tierConfig.monthlyPoints,
        pointsUsed: 0,
        pointsEarned: 0,
        pointsResetDate: new Date(subscription.current_period_end * 1000),
      },
    });

    console.log(`Subscription created for developer ${developer.id}, tier: ${tier}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const tier = subscription.metadata.tier as string;
    
    const developer = await prisma.developer.findFirst({
      where: { customerId },
    });

    if (!developer) {
      console.error('Developer not found for customer:', customerId);
      return;
    }

    const tierConfig = await configService.getSubscriptionTier(tier as any);

    await prisma.developer.update({
      where: { id: developer.id },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: subscription.status,
        subscriptionEnd: new Date(subscription.current_period_end * 1000),
        monthlyPoints: tierConfig.monthlyPoints,
        pointsResetDate: new Date(subscription.current_period_end * 1000),
      },
    });

    console.log(`Subscription updated for developer ${developer.id}, status: ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    
    const developer = await prisma.developer.findFirst({
      where: { customerId },
    });

    if (!developer) {
      console.error('Developer not found for customer:', customerId);
      return;
    }

    // Reset to free tier
    const freeConfig = await configService.getSubscriptionTier('FREE');

    await prisma.developer.update({
      where: { id: developer.id },
      data: {
        subscriptionTier: 'FREE',
        subscriptionStatus: 'cancelled',
        subscriptionEnd: new Date(),
        monthlyPoints: freeConfig.monthlyPoints,
        pointsUsed: 0,
        pointsEarned: 0,
        pointsResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    console.log(`Subscription deleted for developer ${developer.id}, reset to FREE tier`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;
    const subscriptionId = invoice.subscription as string;
    
    const developer = await prisma.developer.findFirst({
      where: { customerId },
    });

    if (!developer) {
      console.error('Developer not found for customer:', customerId);
      return;
    }

    // Reset monthly points and usage for new billing period
    const tierConfig = await configService.getSubscriptionTier(developer.subscriptionTier);
    
    await prisma.developer.update({
      where: { id: developer.id },
      data: {
        subscriptionStatus: 'active',
        monthlyPoints: tierConfig.monthlyPoints,
        pointsUsed: 0,
        pointsEarned: 0,
        pointsResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    console.log(`Payment succeeded for developer ${developer.id}, points reset`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;
    
    const developer = await prisma.developer.findFirst({
      where: { customerId },
    });

    if (!developer) {
      console.error('Developer not found for customer:', customerId);
      return;
    }

    await prisma.developer.update({
      where: { id: developer.id },
      data: {
        subscriptionStatus: 'past_due',
      },
    });

    console.log(`Payment failed for developer ${developer.id}, status set to past_due`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}