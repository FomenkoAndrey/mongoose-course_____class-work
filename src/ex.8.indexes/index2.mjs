import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const productSchema = new mongoose.Schema({
  name: { type: String },
  category: { type: String },
  price: { type: Number },
  inStock: { type: Boolean }
})

productSchema.index(
  { category: 1, price: -1 }
)

productSchema.index(
  { inStock: 1, price: 1 }
)

const Product = mongoose.model('product', productSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('products')

    try {
      console.log(chalk.cyanBright('--- Створення композитних індексів ---'))
      try {
        await Product.createIndexes()
        console.log(chalk.greenBright('✅ Композитні індекси створено'))
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка створення індексів:'), error.message)
        return
      }

      await Product.create([
        { name: 'iPhone', category: 'electronics', price: 999, inStock: true },
        { name: 'Samsung TV', category: 'electronics', price: 1200, inStock: false },
        { name: 'MacBook', category: 'electronics', price: 1500, inStock: true },
        { name: 'T-shirt', category: 'clothing', price: 25, inStock: true },
        { name: 'Jeans', category: 'clothing', price: 80, inStock: true },
        { name: 'Sneakers', category: 'clothing', price: 120, inStock: false },
        { name: 'Coffee Maker', category: 'appliances', price: 150, inStock: true }
      ])
      console.log(chalk.greenBright('Products created'))

      console.log(chalk.cyanBright('\n--- Електроніка дешевше $1300 (відсортована за ціною) ---'))
      const cheapElectronics = await Product.find({
        category: 'electronics',
        price: { $lt: 1300 }
      }).sort({ price: -1 })

      cheapElectronics.forEach((product) => {
        console.log(`${product.name}: $${product.price}`)
      })

      console.log(chalk.cyanBright('\n--- Всі товари категорії "clothing" ---'))
      const clothingItems = await Product.find(
        { category: 'clothing' }
      )

      clothingItems.forEach((product) => {
        console.log(`${product.name}: $${product.price} (${product.inStock ? 'В наявності' : 'Немає'})`)
      })

      console.log(chalk.cyanBright('\n--- Товари в наявності дешевше $200 ---'))
      const availableAndCheap = await Product.find({
        inStock: true,
        price: { $lt: 200 }
      }).sort({ price: 1 })

      availableAndCheap.forEach((product) => {
        console.log(`${product.name}: $${product.price} (${product.category})`)
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
