import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: { type: String }
})

userSchema.index(
  { phone: 1 },
  { unique: true, sparse: true }
)

const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('users')

    try {
      console.log(chalk.cyanBright('--- Створення унікальних індексів ---'))
      try {
        await User.createIndexes()
        console.log(chalk.greenBright('✅ Унікальні індекси створено'))
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка створення індексів:'), error.message)
        return
      }

      console.log(chalk.cyanBright('\n--- Створення користувачів ---'))

      const user1 = await User.create({
        username: 'john_doe',
        email: 'john@example.com',
        phone: '+1234567890'
      })
      console.log(chalk.greenBright(`✅ Користувач створений: ${user1.username}`))

      const user2 = await User.create({
        username: 'jane_smith',
        email: 'jane@example.com'
      })
      console.log(chalk.greenBright(`✅ Користувач створений: ${user2.username}`))

      console.log(chalk.cyanBright('\n--- Спроба створити дублікат username ---'))
      try {
        await User.create({
          username: 'john_doe',
          email: 'john2@example.com'
        })
      } catch (error) {
        if (error.code === 11000) {
          console.log(chalk.redBright('❌ Помилка: Username уже існує'))
          console.log(`   Поле: ${Object.keys(error.keyPattern)[0]}`)
          console.log(`   Значення: ${Object.values(error.keyValue)[0]}`)
        }
      }

      console.log(chalk.cyanBright('\n--- Спроба створити дублікат email ---'))
      try {
        await User.create({
          username: 'bob_wilson',
          email: 'john@example.com'
        })
      } catch (error) {
        if (error.code === 11000) {
          console.log(chalk.redBright('❌ Помилка: Email уже існує'))
          console.log(`   Поле: ${Object.keys(error.keyPattern)[0]}`)
          console.log(`   Значення: ${Object.values(error.keyValue)[0]}`)
        }
      }

      console.log(chalk.cyanBright('\n--- Спроба створити дублікат phone ---'))
      try {
        await User.create({
          username: 'alice_brown',
          email: 'alice@example.com',
          phone: '+1234567890'
        })
      } catch (error) {
        if (error.code === 11000) {
          console.log(chalk.redBright('❌ Помилка: Телефон уже існує'))
          console.log(`   Поле: ${Object.keys(error.keyPattern)[0]}`)
          console.log(`   Значення: ${Object.values(error.keyValue)[0]}`)
        }
      }

      console.log(chalk.cyanBright('\n--- Створення ще одного користувача без телефону ---'))
      const user3 = await User.create({
        username: 'charlie_brown',
        email: 'charlie@example.com'
      })
      console.log(chalk.greenBright(`✅ Користувач створений: ${user3.username}`))

      console.log(chalk.cyanBright('\n--- Всі користувачі в базі ---'))
      const allUsers = await User.find()
      allUsers.forEach((user) => {
        console.log(`👤 ${user.username} (${user.email}) ${user.phone ? '📞 ' + user.phone : ''}`)
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
