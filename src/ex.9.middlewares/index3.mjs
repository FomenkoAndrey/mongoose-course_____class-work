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

userSchema.pre('save', async function (next) {
  console.log('Pre-save middleware called')
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }
  next()
})

userSchema.pre('find', async function (next) {
  console.log('Pre-find middleware called')
  next()
})

userSchema.pre('findOne', async function (next) {
  console.log('Pre-findOne middleware called')
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

      const user = await User.findOne({ name: 'John Smith' })
      console.log(chalk.magentaBright('Search result:'), user)
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
