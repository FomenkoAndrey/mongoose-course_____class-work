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

    await User.insertMany(users)
    console.log(chalk.greenBright('Users added to the database'))

    const indexes = await User.collection.indexes()
    console.log(chalk.cyanBright('Indexes of the users collection:'), indexes)

    const searchResult = await User.collection
      .find(
        { $text: { $search: 'John Smith' } },
        {
          projection: {
            person: 1, _id: 0, score: {
              $meta: 't' +
                'extScore'
            }
          }
        })
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
      .toArray()
    console.log(chalk.magentaBright('Search results:'), searchResult)

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    await mongoose.disconnect()
  }
}

run()
