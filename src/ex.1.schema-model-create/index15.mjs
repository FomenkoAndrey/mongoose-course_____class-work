import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'

const userSchema = new mongoose.Schema({
  name: { type: String }
})

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await User.collection.drop()

    const bulkOperations = [
      { insertOne: { document: { name: 'Alice' } } },
      { insertOne: { document: { name: 'Bob' } } },
      { insertOne: { document: { name: 'Charlie' } } },
      {
        updateOne: {
          filter: { name: 'Alice' },
          update: { $set: { name: 'ALICE' } }
        }
      }
    ]

    const bulkWriteResult = await User.bulkWrite(bulkOperations)
    console.log(chalk.greenBright('Bulk write executed'), bulkWriteResult)

    const searchResult = await User.collection.find({}).toArray()
    console.log(chalk.magentaBright('Search results:'), searchResult)

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    await mongoose.disconnect()
  }
}

run()
