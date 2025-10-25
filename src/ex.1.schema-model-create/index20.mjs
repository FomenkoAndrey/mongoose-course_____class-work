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
      await User.create(users)
      console.log(chalk.black.greenBright('Users added to the database'))

      const countBefore = await User.countDocuments()
      console.log(chalk.black.bgGreenBright('Count before deletion:'), countBefore)

      const deletionResult = await User.deleteMany({ age: { $gt: 30 } })
      console.log(chalk.blueBright('Documents deleted'), deletionResult)

      const countAfter = await User.countDocuments()
      console.log(chalk.black.bgRedBright('Count after deletion:'), countAfter)
    } catch (error) {
      console.log(chalk.black.bgRedBright('Error saving users:'), error.message)
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  } finally {
    await mongoose.disconnect()
  }
}

run()
