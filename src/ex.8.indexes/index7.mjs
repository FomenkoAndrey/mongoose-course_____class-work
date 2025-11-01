import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String },
    inStock: { type: Boolean, default: true }
  },
  {
    autoIndex: false
  }
)

productSchema.index({ name: 1 })
productSchema.index({ price: -1 })
productSchema.index({ category: 1, price: -1 })
productSchema.index({ inStock: 1 })

const Product = mongoose.model('product', productSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('products')

    try {
      console.log(chalk.cyanBright('--- Створення товарів (без індексів) ---'))

      await Product.create([
        { name: 'iPhone 15', price: 999, category: 'electronics', description: 'Latest smartphone' },
        { name: 'MacBook Pro', price: 2499, category: 'electronics', description: 'Professional laptop' },
        { name: 'T-shirt', price: 29, category: 'clothing', description: 'Cotton t-shirt' },
        { name: 'Coffee Maker', price: 199, category: 'appliances', description: 'Automatic coffee maker' }
      ])
      console.log(chalk.greenBright('✅ Товари створені'))

      console.log(chalk.cyanBright('\n--- Перевірка індексів ПЕРЕД створенням ---'))
      let indexes = await Product.listIndexes()
      console.log(
        '📋 Наявні індекси:',
        indexes.map((idx) => idx.name)
      )

      console.log(chalk.cyanBright('\n--- Створення індексів зі схеми ---'))
      try {
        await Product.createIndexes()
        console.log(chalk.greenBright('\n✅ Всі індекси зі схеми створено'))
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка створення індексів:'), error.message)
      }

      console.log(chalk.cyanBright('\n--- Створення кастомного текстового індексу ---'))
      try {
        await Product.collection.createIndex(
          { name: 'text', description: 'text' },
          {
            background: true,
            name: 'text_search_index'
          }
        )
        console.log(chalk.greenBright('✅ Текстовий індекс створено'))
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка створення текстового індексу:'), error.message)
      }

      console.log(chalk.cyanBright('\n--- Створення кастомного композитного індексу ---'))
      try {
        await Product.collection.createIndex(
          { category: 1, inStock: 1, price: -1 },
          {
            name: 'category_stock_price_index',
            background: true
          }
        )
        console.log(chalk.greenBright('✅ Композитний індекс створено'))
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка створення композитного індексу:'), error.message)
      }

      console.log(chalk.cyanBright('\n--- Перевірка індексів ПІСЛЯ створення ---'))
      indexes = await Product.listIndexes()
      console.log('📋 Всі індекси:')
      indexes.forEach((index) => {
        console.log(`   🔍 ${index.name}: ${JSON.stringify(index.key)}`)
      })

      console.log(chalk.cyanBright('\n--- Тестування роботи індексів ---'))

      const phoneQuery = await Product.find({ name: 'iPhone 15' })
      console.log(`📱 Знайдено за назвою: ${phoneQuery.length} товарів`)

      const electronicsCheap = await Product.find({
        category: 'electronics',
        price: { $lt: 1500 }
      })
      console.log(`💻 Електроніка дешевше $1500: ${electronicsCheap.length} товарів`)

      const textSearch = await Product.find({ $text: { $search: 'smartphone laptop' } })
      console.log(`🔍 Знайдено за текстом: ${textSearch.length} товарів`)

      console.log(chalk.cyanBright('\n--- Аналіз використання індексу ---'))
      const explainResult = await Product.find({ category: 'electronics' }).explain('executionStats')
      const stage = explainResult.executionStats.executionStages
      const execStats = explainResult.executionStats

      console.log(`🎯 Тип сканування: ${stage.stage}`)
      if (stage.indexName) {
        console.log(`📊 Використаний індекс: ${stage.indexName}`)
      }
      console.log(`📈 Оглянуто документів: ${execStats.totalDocsExamined}`)
      console.log(`📄 Повернуто документів: ${execStats.nReturned}`)

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
