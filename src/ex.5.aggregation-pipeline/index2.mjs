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

      const result = await User.aggregate([
        { $match: { age: { $gt: 20 } } },
        { $group: { _id: '$age', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
      console.log(chalk.redBright('Users by age (sorted):'), result)
    } catch (error) {
      console.log(chalk.bgRedBright('Error:'), error.message)
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  } finally {
    await mongoose.disconnect()
  }
}

run()
