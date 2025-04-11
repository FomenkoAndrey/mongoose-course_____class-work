import mongoose from 'mongoose'
import { User } from '../common/userSchema.mjs'
import chalk from 'chalk'

export async function dropCollectionByName(collectionName) {
  try {
    await mongoose.connection.dropCollection(collectionName)
    console.log(chalk.redBright(`The collection "${collectionName}" has been deleted`))

    await User.createIndexes()
    console.log(chalk.blueBright('Indexes created'))
  } catch (error) {
    console.log(chalk.redBright('Error when deleting or creating the collection:'), error)
  }
}
