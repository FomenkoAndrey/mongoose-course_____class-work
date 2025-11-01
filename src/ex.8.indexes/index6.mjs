import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  email: { type: String },
  premium: { type: Boolean, default: false }
})

userSchema.index(
  { name: 1 },
  {
    partialFilterExpression: {
      age: { $gte: 18 },
      isActive: true
    }
  }
)

userSchema.index(
  { email: 1 },
  {
    partialFilterExpression: {
      premium: true,
      email: { $exists: true }
    }
  }
)

userSchema.index(
  { age: -1 },
  {
    partialFilterExpression: {
      isActive: true
    }
  }
)

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('users')

    try {
      console.log(chalk.cyanBright('--- Створення часткових індексів ---'))
      try {
        await User.createIndexes()
        console.log(chalk.greenBright('✅ Часткові індекси створено'))
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка створення індексів:'), error.message)
        return
      }

      console.log(chalk.cyanBright('\n--- Створення користувачів ---'))

      await User.create([
        { name: 'Alice', age: 25, isActive: true, email: 'alice@example.com', premium: true },
        { name: 'Bob', age: 30, isActive: true, email: 'bob@example.com', premium: false },
        { name: 'Charlie', age: 22, isActive: true, premium: true },

        { name: 'Diana', age: 16, isActive: true },
        { name: 'Eve', age: 28, isActive: false },
        { name: 'Frank', age: 15, isActive: false },

        { name: 'Grace', age: 35, isActive: true, email: 'grace@example.com', premium: true }
      ])
      console.log(chalk.greenBright('✅ Користувачі створені'))

      console.log(chalk.cyanBright('\n--- Пошук активних дорослих користувачів за ім\'ям ---'))
      const activeAdults = await User.find({
        name: 'Alice',
        isActive: true,
        age: { $gte: 18 }
      })

      activeAdults.forEach((user) => {
        console.log(`👤 ${user.name} (${user.age} років, активний: ${user.isActive})`)
      })

      console.log(chalk.cyanBright('\n--- Пошук неактивних користувачів (без використання індексу) ---'))
      const inactiveUsers = await User.find(
        { isActive: false }
      )

      inactiveUsers.forEach((user) => {
        console.log(`👤 ${user.name} (${user.age} років, активний: ${user.isActive})`)
      })

      console.log(chalk.cyanBright('\n--- Пошук преміум користувачів за email ---'))
      const premiumUser = await User.findOne({
        email: 'alice@example.com',
        premium: true
      })

      if (premiumUser) {
        console.log(`👑 Преміум користувач: ${premiumUser.name} (${premiumUser.email})`)
      }

      console.log(chalk.cyanBright('\n--- Активні користувачі, відсортовані за віком (спадання) ---'))
      const activeSorted = await User.find(
        { isActive: true }
      ).sort({ age: -1 })

      activeSorted.forEach((user) => {
        console.log(`👤 ${user.name}: ${user.age} років`)
      })

      console.log(chalk.cyanBright('\n--- Статистика ---'))
      const totalUsers = await User.countDocuments()
      const activeUsers = await User.countDocuments({ isActive: true })
      const activeAdultsCount = await User.countDocuments({
        isActive: true,
        age: { $gte: 18 }
      })
      const premiumUsers = await User.countDocuments({ premium: true })

      console.log(`📊 Всього користувачів: ${totalUsers}`)
      console.log(`📊 Активних користувачів: ${activeUsers}`)
      console.log(`📊 Активних дорослих (індексовані): ${activeAdultsCount}`)
      console.log(`📊 Преміум користувачів: ${premiumUsers}`)
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
