import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    skills: [{ type: String }]
  },
  {
    skipVersioning: {
      skills: true
    }
  }
)

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await User.collection.drop()

    const user = await User.create({ name: 'John Doe', skills: ['HTML'] })
    console.log(chalk.cyanBright('  Start skills, version:'), user.__v)

    user.skills.push('CSS')
    await user.save()
    console.log(chalk.yellowBright('Updated skills, version:'), user.__v)

    user.skills.push('JavaScript')
    await user.save()
    console.log(chalk.blueBright('Updated skills, version:'), user.__v)

    const searchResult = await User.find()
    console.log(chalk.magentaBright('Search results:'), searchResult)

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    await mongoose.disconnect()
  }
}

run()
