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
      console.log(chalk.greenBright('Users added to the database'))

      const countBefore = await User.countDocuments()
      console.log(chalk.bgGreenBright('Count before deletion:'), countBefore)

      const deletionResult = await User.deleteOne({ age: { $gt: 30 } })
      console.log(chalk.blueBright('Documents deleted'), deletionResult)

      const countAfter = await User.countDocuments()
      console.log(chalk.bgRedBright('Count after deletion:'), countAfter)
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
