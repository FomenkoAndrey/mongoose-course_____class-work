import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import { users } from '../helpers/fakeUsers.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String }
})

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('users')

    try {
      await User.create([
        { firstName: 'John', lastName: 'Smith' },
        { firstName: 'Jane', lastName: 'Doe' }
      ])
      console.log(chalk.greenBright('Users added to the database'))

      const removedUser = await User.findOneAndDelete(
        { firstName: 'Jane', lastName: 'Doe' }
      )
      console.log(chalk.black.bgMagentaBright('Removed user:'), removedUser)

      const notFoundUser = await User.findOneAndDelete(
        { firstName: 'Nonexistent', lastName: 'User' }
      )
      console.log(chalk.black.bgRedBright('Nonexistent user remove attempt:'), notFoundUser)

      const query = await User.find({})
      console.log(chalk.magentaBright('Search results:'), query)
    } catch (error) {
      console.log(chalk.black.bgRedBright('Error saving users:'), error.message)
    }

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    await mongoose.disconnect()
  }
}

run()
