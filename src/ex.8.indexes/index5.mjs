import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  token: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60
  }
})

const tempCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  userId: { type: String, required: true },
  purpose: { type: String, required: true },
  expiresAt: {
    type: Date,
    default: Date.now
  }
})

tempCodeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 30 }
)

const Session = mongoose.model('session', sessionSchema)
const TempCode = mongoose.model('tempcode', tempCodeSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('sessions')
    await dropCollectionByName('tempcodes')

    try {
      console.log(chalk.cyanBright('--- Створення TTL індексів ---'))
      try {
        await Session.createIndexes()
        await TempCode.createIndexes()
        console.log(chalk.greenBright('✅ TTL індекси створено'))
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка створення індексів:'), error.message)
        return
      }

      console.log(chalk.cyanBright('\n--- Створення сесій користувачів ---'))

      await Session.create([
        { userId: 'user1', token: 'token_abc123' },
        { userId: 'user2', token: 'token_def456' },
        { userId: 'user3', token: 'token_ghi789' }
      ])
      console.log(chalk.greenBright('✅ 3 сесії створено'))

      console.log(chalk.cyanBright('\n--- Створення тимчасових кодів ---'))

      await TempCode.create([
        { code: '123456', userId: 'user1', purpose: 'email_verification' },
        { code: '789012', userId: 'user2', purpose: 'password_reset' }
      ])
      console.log(chalk.greenBright('✅ 2 тимчасові коди створено'))

      let sessionCount = await Session.countDocuments()
      let codeCount = await TempCode.countDocuments()
      console.log(chalk.yellowBright(`\n📊 Зараз в базі: ${sessionCount} сесій, ${codeCount} кодів`))

      console.log(chalk.magentaBright('\n⏳ Чекаємо 15 секунд...'))
      await new Promise((resolve) => setTimeout(resolve, 15000))

      sessionCount = await Session.countDocuments()
      codeCount = await TempCode.countDocuments()
      console.log(chalk.yellowBright(`📊 Через 15 секунд: ${sessionCount} сесій, ${codeCount} кодів`))

      console.log(chalk.magentaBright('\n⏳ Чекаємо ще 20 секунд (загалом 35 секунд)...'))
      await new Promise((resolve) => setTimeout(resolve, 20000))

      sessionCount = await Session.countDocuments()
      codeCount = await TempCode.countDocuments()
      console.log(chalk.yellowBright(`📊 Через 35 секунд: ${sessionCount} сесій, ${codeCount} кодів`))

      if (codeCount === 0) {
        console.log(chalk.greenBright('✅ Тимчасові коди видалені автоматично через 30 секунд!'))
      }

      console.log(chalk.magentaBright('\n⏳ Чекаємо ще 70 секунд (загалом 105 секунд)...'))
      await new Promise((resolve) => setTimeout(resolve, 70000))

      sessionCount = await Session.countDocuments()
      codeCount = await TempCode.countDocuments()
      console.log(chalk.yellowBright(`📊 Через 105 секунд: ${sessionCount} сесій, ${codeCount} кодів`))

      if (sessionCount === 0) {
        console.log(chalk.greenBright('✅ Сесії видалені автоматично через 60 секунд!'))
      }

      if (codeCount === 0) {
        console.log(chalk.greenBright('✅ Тимчасові коди видалені автоматично (TTL 30 секунд, із затримкою)'))
      }

      console.log(chalk.cyanBright('\n--- Створення нової сесії ---'))
      await Session.create({ userId: 'user4', token: 'token_new123' })

      const newSessionCount = await Session.countDocuments()
      console.log(chalk.greenBright(`✅ Нова сесія створена. Всього сесій: ${newSessionCount}`))
      console.log(chalk.magentaBright('🔄 TTL індекс буде видаляти і цю сесію через 60-120 секунд після її створення'))
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
