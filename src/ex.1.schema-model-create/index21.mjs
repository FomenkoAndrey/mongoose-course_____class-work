import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import { User } from '../common/userSchema.mjs'
import { users } from '../helpers/fakeUsers.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('users')

    try {
      await User.insertMany(users)
      console.log(chalk.greenBright('Users added to the database'))

      const count = await User.countDocuments()
      console.log(chalk.bgGreenBright('Count documents:'), count)

      const uniqueAges = await User.distinct('age')
      console.log(chalk.bgRedBright('Number of unique ages:'), uniqueAges.length)
      console.log(chalk.redBright('Unique ages:'), uniqueAges)
    } catch (error) {
      console.log(chalk.bgRedBright('Error saving users:'), error.message)
    }

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    await mongoose.disconnect()
  }
}

run()
