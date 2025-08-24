const mongoose = require('mongoose');

async function connectToDatabase(mongoUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri,{
    // useNewUrlParser: true,
    // useUnifiedTopology:true
  });
  console.log('Connected to MongoDB');
}

module.exports = { connectToDatabase };


