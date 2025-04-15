import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'
import { delay } from '../helpers/delay.mjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    skills: [{ type: String }]
  },
  {
    timestamps: true
  }
)

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await User.collection.drop()

    const user = await User.create({ name: 'John Doe', skills: ['HTML'] })

    let searchResult = await User.find()
    console.log(chalk.magentaBright('Search results:'), searchResult)

    await delay(5000)

    user.skills.push('CSS')
    await user.save()

    searchResult = await User.find()
    console.log(chalk.magentaBright('Search results:'), searchResult)

    await delay(5000)

    user.skills.push('JavaScript')
    await user.save()

    searchResult = await User.find()
    console.log(chalk.magentaBright('Search results:'), searchResult)

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    await mongoose.disconnect()
  }
}

run()
