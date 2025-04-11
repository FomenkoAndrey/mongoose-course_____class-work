import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String }
})

const userSchema = new mongoose.Schema({
  name: { type: String },
  address: addressSchema
})

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await User.collection.drop()

    try {
      const newUser = await User.create({
        name: 'John Doe',
        address: { street: '123 Main St', city: 'Anytown' }
      })
      console.log(chalk.greenBright('User added to the database'), newUser)
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
