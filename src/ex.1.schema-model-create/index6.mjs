import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'

const userSchema = new mongoose.Schema({
  mixedField: mongoose.Schema.Types.Mixed
})

const User = mongoose.model('user', userSchema)

const mixedUsers = [
  { mixedField: 'Просто рядок' },
  {
    mixedField: {
      obj: { key: 'value' },
      arr: [1, 2, 3],
      num: 123
    }
  },
  { mixedField: [1, 2, 3, 'різні типи даних'] }
]

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await User.collection.drop()

    try {
      await User.create(mixedUsers)
      console.log(chalk.greenBright('Users added to the database'))
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
