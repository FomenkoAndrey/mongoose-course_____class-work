import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'

const userSchema = new mongoose.Schema({
  name: { type: String }
})

// ! Варіант 1 для створення індексу
userSchema.index({ name: 'text' })

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await User.collection.drop()

    // Варіант 2 для створення індексу
    // userSchema.index({ name: 'text' })

    await User.createCollection()
    console.log(chalk.greenBright('Collection "users" created'))

    await User.createIndexes()

    await User.create({ name: 'John' })

  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  } finally {
    await mongoose.disconnect()
  }
}

run()
