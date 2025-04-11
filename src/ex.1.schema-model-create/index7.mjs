import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'

const userSchema = new mongoose.Schema({
  dataMap: {
    type: Map,
    of: String
  }
})

const User = mongoose.model('user', userSchema)

const mapUsers = [
  {
    dataMap: new Map([
      ['key1', 'value1'],
      ['key2', 'value2']
    ])
  },
  { dataMap: new Map([['anotherKey', 'anotherValue']]) }
]

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await User.collection.drop()

    try {
      const result = await User.create(mapUsers)
      console.log(chalk.greenBright('Users added to the database'))
      console.log(chalk.redBright(result[0].dataMap instanceof Map))
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
