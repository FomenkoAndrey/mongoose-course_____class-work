import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import { users } from '../helpers/fakeUsers.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String }
})

userSchema
  .virtual('fullName')
  .get(function () {
    return `${this.firstName} ${this.lastName}`
  })
  .set(function (fullName) {
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
      const newUser = new User()
      newUser.fullName = 'Emily Johnson'
      await newUser.save()
      console.log(chalk.greenBright('User added with fullName'))

      const query = await User.find({})

      query.forEach((doc) => {
        console.log(chalk.cyanBright('Document:'), doc)
        console.log(chalk.magentaBright('Search results, fullName:'), doc.fullName)
      })
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
