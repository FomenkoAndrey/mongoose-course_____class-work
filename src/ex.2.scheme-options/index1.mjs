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
    console.log(chalk.redBright('Existing collection dropped'))

    await mongoose.connection.createCollection('users', { capped: true, size: 256 })
    console.log(chalk.greenBright('Capped collection "users" created'))

    async function addUserPeriodically() {
      let counter = 0
      while (counter < 100) {
        const userName = `User_${counter}`
        await User.create({ name: userName })
        console.log(chalk.blue(`User ${userName} created`))
        counter++
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const searchResult = await User.collection.find(
          {},
          { projection: { name: 1, _id: 0 } }
        ).toArray()
        console.log(chalk.magentaBright('Search results:'), searchResult)
      }
    }

    await addUserPeriodically()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    await mongoose.disconnect()
  }
}

run()
