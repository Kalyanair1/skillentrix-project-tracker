const mongoose = require('mongoose')

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing. Add it to backend/.env before starting the server.')
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 2000,
  })
  console.log('MongoDB connected successfully.')
}

module.exports = connectDB
