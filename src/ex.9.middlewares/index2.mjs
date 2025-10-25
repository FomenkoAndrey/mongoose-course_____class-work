import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import { users } from '../helpers/fakeUsers.mjs'
import chalk from 'chalk'
import bcrypt from 'bcrypt'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const userSchema = new mongoose.Schema({
  name: { type: String },
  password: { type: String }
})

userSchema.pre('save', async function(next) {
  console.log('Pre-save middleware called')
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }
  next()
})

userSchema.pre('find', async function(next) {
  console.log(chalk.red('Pre-find middleware called'))
  next()
})

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('users')

    try {
      await User.create({ name: 'John Smith', password: '12345' })

      console.log(chalk.greenBright('Users added to the database'))

      const query = await User.find({})
      console.log(chalk.magentaBright('Search results:'), query)

      const passwordToCheck = '12345'
      const user = query[0]

      const isMatch = await bcrypt.compare(passwordToCheck, user.password)
      console.log(chalk.black.bgRedBright(`Does the password "${passwordToCheck}" match? ${isMatch}`))
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
