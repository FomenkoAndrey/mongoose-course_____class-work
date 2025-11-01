// noinspection D

import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: Number, default: 1 },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  assignee: { type: String },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
})

taskSchema.index({ title: 1 })
taskSchema.index({ status: 1, priority: -1 })
taskSchema.index({ assignee: 1 })
taskSchema.index({ dueDate: 1 })

const Task = mongoose.model('task', taskSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('tasks')

    try {
      console.log(chalk.cyanBright('--- Створення тестових завдань ---'))

      await Task.create([
        {
          title: 'Setup project',
          description: 'Initialize new project',
          priority: 3,
          status: 'completed',
          assignee: 'john'
        },
        { title: 'Write tests', description: 'Add unit tests', priority: 2, status: 'in_progress', assignee: 'jane' },
        {
          title: 'Deploy to staging',
          description: 'Deploy latest version',
          priority: 1,
          status: 'pending',
          assignee: 'bob'
        },
        { title: 'Code review', description: 'Review pull request', priority: 2, status: 'pending', assignee: 'alice' }
      ])
      console.log(chalk.greenBright('✅ Завдання створені'))

      console.log(chalk.cyanBright('\n--- 📋 Перегляд всіх індексів ---'))
      const allIndexes = await Task.listIndexes()
      console.log(`Загальна кількість індексів: ${allIndexes.length}`)

      allIndexes.forEach((index, i) => {
        console.log(`${i + 1}. ${chalk.yellowBright(index.name)}:`)
        console.log(`   Ключі: ${JSON.stringify(index.key)}`)
        if (index.unique) console.log(`   Унікальний: ${index.unique}`)
        if (index.sparse) console.log(`   Розріджений: ${index.sparse}`)
        if (index.expireAfterSeconds) console.log(`   TTL: ${index.expireAfterSeconds} секунд`)
      })

      console.log(chalk.cyanBright('\n--- 🔧 Створення додаткових індексів ---'))

      try {
        await Task.collection.createIndex(
          { title: 'text', description: 'text' },
          { name: 'task_text_search' }
        )
        console.log(chalk.greenBright('✅ Текстовий індекс створено'))
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка створення текстового індексу:'), error.message)
      }

      try {
        await Task.collection.createIndex(
          { status: 1, dueDate: 1, priority: -1 },
          { name: 'status_due_priority_index' }
        )
        console.log(chalk.greenBright('✅ Композитний індекс створено'))
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка створення композитного індексу:'), error.message)
      }

      console.log(chalk.cyanBright('\n--- 📋 Перегляд індексів після додавання ---'))
      const updatedIndexes = await Task.listIndexes()
      console.log(`Тепер індексів: ${updatedIndexes.length}`)
      updatedIndexes.forEach((index) => {
        console.log(`   🔍 ${index.name}`)
      })

      console.log(chalk.cyanBright('\n--- 🗑️ Видалення індексу ---'))
      try {
        await Task.collection.dropIndex('assignee_1')
        console.log(chalk.greenBright('✅ Індекс "assignee_1" видалено'))
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка видалення індексу:'), error.message)
      }

      console.log(chalk.cyanBright('\n--- 🗑️ Видалення індексу за ключами ---'))
      try {
        await Task.collection.dropIndex({ dueDate: 1 })
        console.log(chalk.greenBright('✅ Індекс за dueDate видалено'))
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка видалення індексу:'), error.message)
      }

      console.log(chalk.cyanBright('\n--- 📋 Перегляд індексів після видалення ---'))
      const afterDeleteIndexes = await Task.listIndexes()
      console.log(`Залишилось індексів: ${afterDeleteIndexes.length}`)
      afterDeleteIndexes.forEach((index) => {
        console.log(`   🔍 ${index.name}`)
      })

      console.log(chalk.cyanBright('\n--- 🔄 Синхронізація індексів ---'))
      try {
        const syncResult = await Task.syncIndexes()
        console.log(chalk.greenBright('✅ Індекси синхронізовано'))

        if (syncResult.length > 0) {
          console.log('Видалені зайві індекси:')
          syncResult.forEach((index) => {
            console.log(`   ❌ ${index}`)
          })
        } else {
          console.log('Жодних зайвих індексів не знайдено')
        }
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка синхронізації:'), error.message)
      }

      console.log(chalk.cyanBright('\n--- 📋 Фінальний список індексів ---'))
      const finalIndexes = await Task.listIndexes()
      console.log(`Кінцева кількість індексів: ${finalIndexes.length}`)
      finalIndexes.forEach((index) => {
        console.log(`   🔍 ${index.name}: ${JSON.stringify(index.key)}`)
      })

      console.log(chalk.cyanBright('\n--- 🧪 Тестування запитів з індексами ---'))

      const pendingTasks = await Task.find({ status: 'pending' }).sort({ priority: -1 })
      console.log(`📋 Знайдено pending завдань: ${pendingTasks.length}`)

      const explainResult = await Task.find({ status: 'in_progress' }).explain('executionStats')
      const stage = explainResult.executionStats.executionStages
      console.log(`🎯 Тип сканування: ${stage.stage}`)
      if (stage.indexName) {
        console.log(`📊 Використаний індекс: ${stage.indexName}`)
      }

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
