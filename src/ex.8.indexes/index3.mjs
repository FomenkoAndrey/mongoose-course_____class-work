import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const articleSchema = new mongoose.Schema({
  title: { type: String },
  content: { type: String },
  author: { type: String },
  tags: [String]
})

articleSchema.index(
  { title: 'text', content: 'text' }
)

const Article = mongoose.model('article', articleSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('articles')

    try {
      await Article.create([
        {
          title: 'Introduction to MongoDB',
          content: 'MongoDB is a NoSQL database that stores data in flexible, JSON-like documents.',
          author: 'John Doe',
          tags: ['database', 'nosql', 'mongodb']
        },
        {
          title: 'Getting Started with Node.js',
          content: 'Node.js is a JavaScript runtime built on Chrome V8 engine for server-side development.',
          author: 'Jane Smith',
          tags: ['javascript', 'nodejs', 'backend']
        },
        {
          title: 'React Development Guide',
          content: 'React is a popular JavaScript library for building user interfaces and single-page applications.',
          author: 'Mike Johnson',
          tags: ['javascript', 'react', 'frontend']
        },
        {
          title: 'Database Design Principles',
          content: 'Good database design involves normalization, indexing, and proper data modeling.',
          author: 'Sarah Wilson',
          tags: ['database', 'design', 'principles']
        }
      ])
      console.log(chalk.greenBright('Articles created'))

      console.log(chalk.cyanBright('\n--- Створення текстових індексів ---'))
      try {
        await Article.createIndexes()
        console.log(chalk.greenBright('✅ Індекси створено'))
      } catch (error) {
        console.log(chalk.redBright('❌ Помилка створення індексів:'), error.message)
        return
      }

      console.log(chalk.cyanBright('\n--- Пошук статей про "JavaScript" ---'))
      const jsArticles = await Article.find(
        { $text: { $search: 'JavaScript' } }
      )

      jsArticles.forEach((article) => {
        console.log(`📄 ${article.title} (автор: ${article.author})`)
      })

      console.log(chalk.cyanBright('\n--- Пошук за фразою "database design" ---'))
      const dbDesignArticles = await Article.find(
        { $text: { $search: '"database design"' } }
      )

      dbDesignArticles.forEach((article) => {
        console.log(`📄 ${article.title}`)
        console.log(`   ${article.content.substring(0, 80)}...`)
      })

      console.log(chalk.cyanBright('\n--- Пошук "database" але БЕЗ "MongoDB" ---'))
      const dbNotMongo = await Article.find(
        { $text: { $search: 'database -MongoDB' } }
      )

      dbNotMongo.forEach((article) => {
        console.log(`📄 ${article.title}`)
      })

      console.log(chalk.cyanBright('\n--- Пошук "database" з показом релевантності ---'))
      const dbArticles = await Article.find(
        { $text: { $search: 'database' } },
        { score: { $meta: 'textScore' } }
      )
        .lean()
        .sort(
          { score: { $meta: 'textScore' } }
        )

      if (dbArticles.length > 0) {
        dbArticles.forEach((article) => {
          const score = article.score || 0
          console.log(`📄 ${article.title} (релевантність: ${score.toFixed(2)})`)
        })
      } else {
        console.log('❌ Жодних статей не знайдено')
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
