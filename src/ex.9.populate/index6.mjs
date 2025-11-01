import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import { users } from '../helpers/fakeUsers.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  colleagues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
})
const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('users')

    try {
      const [user1, user2, user3] = await User.create([
        { firstName: 'John', lastName: 'Smith' },
        { firstName: 'Jane', lastName: 'Smith' },
        { firstName: 'Bob', lastName: 'Johnson' }
      ])

      user1.colleagues.push(user2._id, user3._id)
      user2.colleagues.push(user1._id, user3._id)
      user3.colleagues.push(user1._id, user2._id)

      await user1.save()
      await user2.save()
      await user3.save()

      console.log(chalk.greenBright('Users and their colleagues have been added to the database'))

      const usersWithColleagues = await User.find()
        .populate(
          'colleagues',
          'firstName lastName -_id'
        )
      console.log(chalk.magentaBright('Users with their colleagues:'), JSON.stringify(usersWithColleagues, null, 2))
    } catch (error) {
      console.log(chalk.bgRedBright('Error saving users:'), error.message)
    }

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    await mongoose.disconnect()
  }
}

run()
