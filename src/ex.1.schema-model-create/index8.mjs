import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'

const userSchema = new mongoose.Schema({
  numericField: Number,
  decimalField: mongoose.Schema.Types.Decimal128
})

const User = mongoose.model('user', userSchema)

const userData = {
  numericField: 0.2,
  decimalField: 0.2
}

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await User.collection.drop()

    try {
      const result = await User.create(userData)
      console.log(chalk.greenBright('User added to the database'))

      const updatedUser = await User.findByIdAndUpdate(
        result._id,
        { $inc: { numericField: 0.1, decimalField: 0.1 } },
        { new: true }
      )

      console.log(chalk.yellowBright('Updated User:'), updatedUser)

      console.log(chalk.black.bgRedBright('Numeric Field Comparison:'), updatedUser.numericField.toString() === '0.3')
      console.log(chalk.black.bgGreenBright('Decimal Field Comparison:'), updatedUser.decimalField.toString() === '0.3')
    } catch (error) {
      console.log(chalk.black.bgRedBright('Error saving users:'), error.message)
    }

    const searchResult = await User.collection.find({}).toArray()
    console.log(chalk.magentaBright('Search results:'), searchResult)

  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  } finally {
    await mongoose.disconnect()
  }
}

run()
