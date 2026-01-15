// Test MongoDB Connection
// Run with: node test-mongodb-connection.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local');
  process.exit(1);
}

console.log('🔌 Testing MongoDB connection...');
console.log('📍 Connection string (password hidden):', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n💡 Possible solutions:');
      console.error('1. Verify your password in MongoDB Atlas → Database Access');
      console.error('2. If password has special characters (@, #, %, etc.), URL-encode them:');
      console.error('   - @ becomes %40');
      console.error('   - # becomes %23');
      console.error('   - % becomes %25');
      console.error('   - & becomes %26');
      console.error('3. Reset the database user password in MongoDB Atlas');
      console.error('4. Ensure your IP is whitelisted in Network Access');
    }
    
    process.exit(1);
  });
