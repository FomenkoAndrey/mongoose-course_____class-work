import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import { users } from '../helpers/fakeUsers.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

userSchema
  .virtual('fullName')
  .get(function() {
    return `${this.firstName} ${this.lastName}`
  })
  .set(function(fullName) {
    const [firstName, lastName] = fullName.split(' ')
    this.set({ firstName, lastName })
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

      const user = await User.findOne({ firstName: 'Jane', lastName: 'Doe' })

      const userJson = user.toJSON()
      console.log(chalk.magentaBright('JSON output:'), userJson)

      const userObject = user.toObject()
      console.log(chalk.yellowBright('Object output:'), userObject)
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
