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

      let query = await User.findOne(
        {
          $text: { $search: 'John' },
          age: { $gt: 10, $lt: 90 }
        },
        {
          '_id': 0,
          'person.first': 1,
          'person.last': 1,
          'age': 1
        }
      )
      console.log(chalk.redBright('Search results:'), query)

      query = await User.findOne(
        {
          $text: { $search: 'John' },
          age: { $gt: 20, $lt: 70 }
        },
        '-_id person.first person.last age'
      )
      console.log(chalk.redBright('Search results:'), query)
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
