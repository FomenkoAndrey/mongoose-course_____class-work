import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import { users } from '../helpers/fakeUsers.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  country: String
})
const Address = mongoose.model('Address', addressSchema)

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }]
})
// ~ Треба писати 'User', але це ім'я вже зайняте dropCollectionByName, який використовує зовнішню userSchema - це проблема коду прикладів, але вона некритична. Тому пишемо 'user'.
const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('users')
    await dropCollectionByName('addresses')

    try {
      const address1 = await Address.create({ street: '123 Main St', city: 'Anytown', country: 'USA' })
      const address2 = await Address.create({ street: '456 Elm St', city: 'Anytown', country: 'USA' })

      await User.create([
        { firstName: 'John', lastName: 'Smith', addresses: [address1._id, address2._id] },
        { firstName: 'Jane', lastName: 'Smith', addresses: [address1._id, address2._id] }
      ])
      console.log(chalk.greenBright('Users added to the database'))

      const users = await User.find({}).populate('addresses')
      console.log(chalk.magentaBright('Search results with populated addresses:'), users.toString())
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
