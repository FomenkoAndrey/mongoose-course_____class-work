import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import { users } from '../helpers/fakeUsers.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 15,
    match: /^[a-zA-Z\s?]+$/
  },
  gender: {
    type: String,
    enum: ['male', 'female']
  },
  age: {
    type: Number,
    required() {
      return this.gender === 'male'
    }
  }
})

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('users')

    try {
      await User.create({ name: 'John Smith', gender: 'male', age: 30, dateOfBirth: new Date('1995-01-01') })
      await User.create({ name: 'Jane Doe', gender: 'female' })
      await User.create({ name: 'Bob Doe', gender: 'male' })

      console.log(chalk.greenBright('Users added to the database'))
    } catch (error) {
      console.log(chalk.black.bgRedBright('Error saving users:'), error.message)
    } finally {
      const query = await User.find({})
      console.log(chalk.magentaBright('Search results:'), query)
    }

  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  } finally {
    await mongoose.disconnect()
  }
}

run()
