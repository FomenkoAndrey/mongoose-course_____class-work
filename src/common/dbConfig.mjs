import dotenv from 'dotenv'

dotenv.config()

export const dbConfig = {
  uri: process.env.MONGODB_URI,
  options: {
    dbName: process.env.DB_NAME,
    serverSelectionTimeoutMS: 5000,
    autoIndex: true,
    bufferCommands: false
  }
}
