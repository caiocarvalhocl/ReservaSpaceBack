import mongoose from 'mongoose';
import { config } from './index';

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

