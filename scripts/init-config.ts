/**
 * Script to initialize default configurations for the subscription and gamification system
 * 
 * Usage: npx tsx scripts/init-config.ts
 */

import { PrismaClient } from '@prisma/client';
import { configService } from '../utils/configService';

const prisma = new PrismaClient();

async function initializeConfigurations() {
  console.log('🚀 Initializing configuration system...');

  try {
    // Initialize default configurations
    await configService.initializeDefaultConfigs();
    console.log('✅ Default configurations initialized');

    // Verify configurations were created
    const configs = await prisma.configurationSettings.findMany({
      where: {
        isActive: true,
      },
    });

    console.log('\n📋 Active configurations:');
    for (const config of configs) {
      console.log(`  - ${config.key} (${config.version}): ${config.description}`);
    }

    // Test configuration retrieval
    console.log('\n🧪 Testing configuration retrieval...');
    
    const pointsCosts = await configService.getPointsCosts();
    console.log('Points costs:', pointsCosts);

    const xpRewards = await configService.getXPRewards();
    console.log('XP rewards:', xpRewards);

    const subscriptionTiers = await configService.getSubscriptionTiers();
    console.log('Subscription tiers:', Object.keys(subscriptionTiers));

    console.log('\n✅ Configuration system initialized successfully!');
    
  } catch (error) {
    console.error('❌ Failed to initialize configurations:', error);
    process.exit(1);
  } finally {
    await configService.disconnect();
    await prisma.$disconnect();
  }
}

// Run the script
initializeConfigurations()
  .then(() => {
    console.log('🎉 Initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });

export { initializeConfigurations };