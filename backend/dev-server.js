const { MongoMemoryServer } = require('mongodb-memory-server-core');
const mongoose = require('mongoose');

async function startDev() {
  console.log('🔄 Starting in-memory MongoDB (no native binary needed)...');
  
  const mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'huduma_ecosystem',
    }
  });
  
  const uri = mongod.getUri();
  console.log(`📦 MongoDB in-memory running at: ${uri}`);
  
  // Set for the server to use
  process.env.MONGODB_URI = uri;
  
  // Start the real server
  require('./server');
}

startDev().catch(console.error);
