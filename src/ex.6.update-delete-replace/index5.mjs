import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
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
      const createdUsers = await User.create([
        { firstName: 'John', lastName: 'Smith' },
        { firstName: 'Jane', lastName: 'Doe' }
      ])
      console.log(chalk.greenBright('Users added to the database'))

      const firstUserId = createdUsers[0]._id
      console.log(chalk.cyanBright('First user ID:'), firstUserId)

      const deletedUser = await User.findByIdAndDelete(firstUserId)
      console.log(chalk.black.bgMagentaBright('Deleted user by ID:'), deletedUser)

      const nonExistentId = new mongoose.Types.ObjectId()
      const notFoundUser = await User.findByIdAndDelete(nonExistentId)
      console.log(chalk.black.bgRedBright('Nonexistent user delete attempt:'), notFoundUser)

      const query = await User.find({})
      console.log(chalk.magentaBright('Search results after deletion:'), query)
    } catch (error) {
      console.log(chalk.black.bgRedBright('Error with user operations:'), error.message)
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  } finally {
    await mongoose.disconnect()
  }
}

run()
