const { Redis } = require('@upstash/redis');

// Test Redis connection
async function testRedis() {
  try {
    const redis = new Redis({
      url: 'https://supreme-badger-36136.upstash.io',
      token: 'AY0oAAIncDI0YzI1OTVkY2RlMDE0NDYxOWU1YTM5N2JkZTU5YWQ1OHAyMzYxMzY',
    });

    console.log('🔄 Testing Redis connection...');

    // Test basic operations
    await redis.set('test:key', 'Hello Redis!');
    const value = await redis.get('test:key');
    console.log('✅ Set/Get test:', value);

    // Test TTL
    await redis.setex('test:ttl', 60, 'Expires in 60 seconds');
    const ttlValue = await redis.get('test:ttl');
    console.log('✅ TTL test:', ttlValue);

    console.log('🎉 Redis is working correctly!');

  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
  }
}

testRedis();
