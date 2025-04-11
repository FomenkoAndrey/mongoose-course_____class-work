import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      alias: 'fullName'
    },
    dob: {
      type: Date,
      alias: 'dateOfBirth'
    }
  },
  { timestamps: true }
)

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await User.collection.drop()

    try {
      const newUser = await User.create({
        fullName: 'John Doe',
        dateOfBirth: new Date('2024-01-01')
      })
      console.log(chalk.greenBright('User added to the database'), newUser)

      console.log(chalk.redBright('Демонструємо роботу аліаса:'))
      console.log(newUser.name)
      console.log(newUser.fullName)
      console.log(newUser.dob)
      console.log(newUser.dateOfBirth)

      let updatedUser = await User.findByIdAndUpdate(
        newUser._id,
        {
          fullName: 'Bob Smith',
          dateOfBirth: new Date('2023-12-12')
        },
        { new: true }
      )
      console.log(chalk.bgRedBright('Wrong update:'), updatedUser)

      updatedUser = await User.findByIdAndUpdate(
        newUser._id,
        {
          name: 'Mary Johns',
          dob: new Date('2025-02-03')
        },
        { new: true }
      )
      console.log(chalk.bgGreenBright('Successful update:'), updatedUser)
    } catch (error) {
      console.log(chalk.bgRedBright('Error saving users:'), error.message)
    }

    const searchResult = await User.collection.find({}).toArray()
    console.log(chalk.magentaBright('Search results:'), searchResult)

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    await mongoose.disconnect()
  }
}

run()
