import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import { User } from '../common/userSchema.mjs'
import { users } from '../helpers/fakeUsers.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'
import fs from 'fs'

const logStream = fs.createWriteStream('./src/ex.4.cursor/log.txt', { flags: 'w' })

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('users')

    try {
      await User.insertMany(users)
      console.log(chalk.greenBright('Users added to the database'))

      const cursor = await User.find(
        {
          $text: { $search: /john/ },
          age: { $gt: 20, $lt: 40 }
        },
        '-_id person.first person.last age'
      ).cursor()

      for await (const doc of cursor) {
        const logMessage = `Document: ${JSON.stringify(doc)}\n`
        logStream.write(logMessage)
        console.log(chalk.magentaBright('Document:'), doc)
      }

      logStream.end()
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
