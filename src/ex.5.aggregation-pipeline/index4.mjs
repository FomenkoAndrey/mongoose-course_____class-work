import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import { User } from '../common/userSchema.mjs'
import { users } from '../helpers/fakeUsers.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const projectSchema = new mongoose.Schema({
  name: String,
  userId: mongoose.Schema.Types.ObjectId
})
const Project = mongoose.model('project', projectSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('users')
    await dropCollectionByName('projects')

    try {
      const insertedUsers = await User.insertMany(users)
      console.log(chalk.greenBright('Users added to the database'))

      const projects = [
        { name: 'Project A', userId: insertedUsers[0]._id },
        { name: 'Project B', userId: insertedUsers[0]._id },
        { name: 'Project C', userId: insertedUsers[1]._id }
      ]
      await Project.insertMany(projects)
      console.log(chalk.greenBright('Projects added to the database'))

      const result = await User.aggregate([
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: 'userId',
            as: 'userProjects'
          }
        },
        {
          $project: {
            'person.first': 1,
            'person.last': 1,
            projectCount: { $size: '$userProjects' },
            _id: 0
          }
        }
      ])
      console.log(chalk.redBright('Users with project count:'), result.slice(0, 10))
      if (result.length > 10) {
        console.log(chalk.gray(`... ${result.length - 10} more items`))
      }
    } catch (error) {
      console.log(chalk.bgRedBright('Error:'), error.message)
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  } finally {
    await mongoose.disconnect()
  }
}

run()
