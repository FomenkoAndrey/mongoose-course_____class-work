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
        { $match: { city: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: '$city',
            averageAge: { $avg: '$age' },
            totalUsers: { $sum: 1 }
          }
        },
        {
          $project: {
            city: '$_id',
            averageAge: { $round: ['$averageAge', 2] },
            totalUsers: 1,
            _id: 0
          }
        },
        { $sort: { averageAge: -1 } }
      ])
      console.log(chalk.redBright('Average age by city:'), result.slice(0, 100))
      if (result.length > 10) {
        console.log(chalk.gray(`... ${result.length - 100} more items`))
      }
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
