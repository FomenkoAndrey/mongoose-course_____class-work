import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'

const addressSchemaWithId = new mongoose.Schema({
  street: { type: String },
  city: { type: String }
})

const addressSchemaWithoutId = new mongoose.Schema(
  {
    street: { type: String },
    city: { type: String }
  },
  {
    _id: false
  }
)

const userSchema = new mongoose.Schema({
  name: { type: String },
  address1: addressSchemaWithId,
  address2: addressSchemaWithoutId
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
        address1: { street: '123 Main St', city: 'Anytown' },
        address2: { street: '456 Main St', city: 'Some town' }
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
