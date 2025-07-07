import { PrismaClient } from '@prisma/client';

// Create two Prisma clients - one for local, one for Neon
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:123456@localhost:5432/sekra"
    }
  }
});

const neonPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_V9cLsxQ2muiB@ep-frosty-sky-a20r9jpy-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function transferData() {
  try {
    // Replace these with your actual table/model names
    const models = ['user', 'post', 'comment']; // Update with your actual model names (lowercase)
    
    for (const model of models) {
      console.log(`\n📦 Transferring ${model} data...`);
      
      try {
        // Get all data from local database
        const localData = await localPrisma[model].findMany();
        console.log(`Found ${localData.length} records in local ${model} table`);
        
        if (localData.length > 0) {
          // Insert data into Neon database
          for (const record of localData) {
            try {
              await neonPrisma[model].create({
                data: record
              });
            } catch (error) {
              console.warn(`Failed to insert ${model} record:`, error.message);
            }
          }
          
          // Verify the transfer
          const neonCount = await neonPrisma[model].count();
          console.log(`✅ ${model}: ${neonCount} records transferred`);
        }
        
      } catch (error) {
        console.warn(`❌ Failed to transfer ${model}:`, error.message);
      }
    }
    
    console.log('\n🎉 Data transfer completed!');
    
  } catch (error) {
    console.error('❌ Transfer failed:', error);
  } finally {
    await localPrisma.$disconnect();
    await neonPrisma.$disconnect();
  }
}

transferData();