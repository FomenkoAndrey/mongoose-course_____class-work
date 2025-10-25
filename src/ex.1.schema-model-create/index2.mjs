import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import { User } from '../common/userSchema.mjs'
import { users } from '../helpers/fakeUsers.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('users')

    const newUser = new User({})
    const result = await newUser.save()
    console.log(chalk.greenBright('User added to the database'))
    console.log(chalk.redBright('Save result:'), result)

    let searchResult = await User.collection.find({}).toArray()

    console.log(chalk.magentaBright('Search results:'), searchResult)

    newUser.set({
      'person.first': 'John',
      'person.last': 'Smith',
      age: 39
    })
    await newUser.save()

    console.log(chalk.greenBright('User updated successfully'))
    console.log(chalk.redBright('The same result after update:'), result)

    searchResult = await User.collection.find({}).toArray()
    console.log(chalk.magentaBright('Search results after update:'), searchResult)

  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  } finally {
    await mongoose.disconnect()
  }
}

run()
