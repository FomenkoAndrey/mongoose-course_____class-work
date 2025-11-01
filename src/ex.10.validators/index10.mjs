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
  sex: {
    type: String,
    enum: ['male', 'female']
  },
  age: {
    type: Number,
    min: 0,
    max: 122
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator(value) {
        return new Promise((resolve) => {
          console.log('Waiting for validation...')
          setTimeout(() => {
            const isValid = value >= new Date(1970, 0, 1) && value <= new Date(2024, 11, 31)
            resolve(isValid)
          }, 3000)
        })
      },
      message({ path, value }) {
        const formattedDate = value.toLocaleDateString('uk-UA', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
        return `Неправильна дата ${path}: ${formattedDate}, допустимо з 01.01.1970 до 31.12.2024.`
      }
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
      await User.create({ name: 'John Smith', sex: 'male', age: 30, dateOfBirth: new Date('1995-01-01') })

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
