const { PrismaClient } = require('@prisma/client');

async function testPrismaClient() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Prisma Client...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Prisma Client connected successfully!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    const roomCount = await prisma.room.count();
    console.log(`🏠 Rooms in database: ${roomCount}`);
    
    const voteCount = await prisma.vote.count();
    console.log(`🗳️ Votes in database: ${voteCount}`);
    
    console.log('🎉 Prisma Client is working correctly!');
    
  } catch (error) {
    console.error('❌ Prisma Client error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaClient();
