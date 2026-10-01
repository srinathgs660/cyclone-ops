const mongoose = require('mongoose');

// Disable query buffering so fallback data responds in milliseconds if Atlas is connecting
mongoose.set('bufferCommands', false);

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 20000,
      tls: true
    });
    console.log('[MongoDB Connected] Host: ' + conn.connection.host + ' | DB: ' + conn.connection.name);
    return conn;
  } catch (err) {
    console.error('[MongoDB Connection Error]:', err.message);
    console.log('[MongoDB] Retrying connection attempt ' + (retryCount + 1) + ' in 5 seconds...');
    setTimeout(() => connectDB(retryCount + 1), 5000);
  }
};

module.exports = connectDB;
