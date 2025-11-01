import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const userSchema = new mongoose.Schema({
  name: { type: String },
  age: { type: Number },
  createdAt: { type: Date, default: Date.now }
})

userSchema.index(
  { age: 1 }
)

userSchema.index(
  { createdAt: -1 }
)

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('users')

    try {
      console.log(chalk.cyanBright('--- Створення індексів ---'))
      try {
        await User.createIndexes()
        console.log(chalk.greenBright('✅ Індекси створено'))
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка створення індексів:'), error.message)
        return
      }

      await User.create([
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
        { name: 'Charlie', age: 20 },
        { name: 'Diana', age: 35 },
        { name: 'Eve', age: 28 }
      ])
      console.log(chalk.greenBright('Test data created'))

      console.log(chalk.cyanBright('\n--- Пошук користувачів віком від 25 років ---'))
      const usersAbove25 = await User.find(
        { age: { $gte: 25 } }
      )
      usersAbove25.forEach((user) => {
        console.log(`${user.name}: ${user.age} років`)
      })

      console.log(chalk.cyanBright('\n--- Сортування за віком (зростання) ---'))
      const usersSortedByAge = await User.find()
        .sort({ age: 1 })
      usersSortedByAge.forEach((user) => {
        console.log(`${user.name}: ${user.age} років`)
      })

      console.log(chalk.cyanBright('\n--- Сортування за датою (новіші спочатку) ---'))
      const usersSortedByDate = await User.find()
        .sort({ createdAt: -1 })
      usersSortedByDate.forEach((user) => {
        console.log(`${user.name}: створено ${user.createdAt.toISOString()}`)
      })
    } catch (error) {
      console.log(chalk.bgRedBright('Error with operations:'), error.message)
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  } finally {
    await mongoose.disconnect()
  }
}

run()
