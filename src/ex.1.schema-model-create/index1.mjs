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

    const collectionsToDrop = [
      'users',
      'customers',
      'logs',
      'neighborhoods',
      'products',
      'projects',
      'renamedCustomers',
      'restaurants',
      'scores',
      'sessions',
      'streets',
      'tasks',
      'tempcodes'
    ]

    for (const name of collectionsToDrop) {
      try {
        await dropCollectionByName(name)
        console.log(chalk.yellowBright(`Dropped collection: ${name}`))
      } catch (err) {
        // Если коллекция не существует или произошла ошибка — просто логируем и продолжаем
        console.warn(chalk.redBright(`Failed to drop ${name}:`), err && err.message ? err.message : err)
      }
    }

    await User.insertMany(users)
    console.log(chalk.greenBright('Users added to the database'))

    const indexes = await User.collection.indexes()
    console.log(chalk.cyanBright('Indexes of the users collection:'), indexes)

    const searchResult = await User.collection
      .find(
        { $text: { $search: 'John Smith' } },
        {
          projection: {
            person: 1, _id: 0, score: { $meta: 'textScore' }
          }
        })
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
      .toArray()
    console.log(chalk.magentaBright('Search results:'), searchResult)

  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  } finally {
    await mongoose.disconnect()
  }
}

run()
