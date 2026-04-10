const mongoose = require('mongoose');

async function test() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/recruitment_db');
    console.log('Connected!');
    await mongoose.disconnect();
    console.log('Disconnected!');
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

test();
