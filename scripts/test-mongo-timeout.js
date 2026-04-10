const mongoose = require('mongoose');

async function test() {
  const uri = 'mongodb://127.0.0.1:27017/recruitment_db';
  try {
    console.log(`Connecting to ${uri}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected!');
    await mongoose.disconnect();
    console.log('Disconnected!');
    process.exit(0);
  } catch (err) {
    console.error('Connection failed details:');
    console.error(err.name);
    console.error(err.message);
    process.exit(1);
  }
}

test();
