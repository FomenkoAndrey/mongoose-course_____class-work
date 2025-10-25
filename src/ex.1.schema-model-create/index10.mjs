import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'
import { delay } from '../helpers/delay.mjs'

const userSchema = new mongoose.Schema(
  {
    name: String
    // createdAt: new Date(),
    // updatedAt: new Date()
  },
  { timestamps: true }
)

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await User.collection.drop()

    try {
      const newUser = await User.create(
        { name: 'John Doe' }
      )
      console.log(chalk.greenBright('User added to the database'), newUser)

      await delay(3000)

      const updatedUser = await User.findByIdAndUpdate(
        newUser._id,
        { name: 'Jane Doe' },
        { new: true }
      )
      console.log(chalk.yellowBright('Updated User:'), updatedUser)
    } catch (error) {
      console.log(chalk.bgRedBright('Error saving users:'), error.message)
    }

    const searchResult = await User.collection.find({}).toArray()
    console.log(chalk.magentaBright('Search results:'), searchResult)

  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  } finally {
    await mongoose.disconnect()
  }
}

run()
