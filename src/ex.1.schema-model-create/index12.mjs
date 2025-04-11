import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: {
      type: String,
      unique: true
    }
  },
  { timestamps: true }
)

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await User.collection.drop()
    await User.createIndexes() // Викликається один раз після оголошення схеми

    try {
      const newUser = await User.create({
        name: 'John Doe',
        email: 'john@example.com'
      })
      console.log(chalk.greenBright('User added to the database'), newUser)

      const newUser2 = await User.create({
        name: 'John Smith',
        email: 'john@example.com'
      })
      console.log(chalk.greenBright('User added to the database'), newUser2)
    } catch (error) {
      console.log(chalk.bgRedBright('Error saving users:'), error.message)
    }

    const searchResult = await User.collection.find({}).toArray()
    console.log(chalk.magentaBright('Search results:'), searchResult)

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    await mongoose.disconnect()
  }
}

run()
