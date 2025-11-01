import mongoose from 'mongoose'
import { dbConfig } from '../common/dbConfig.mjs'
import { users } from '../helpers/fakeUsers.mjs'
import chalk from 'chalk'
import { dropCollectionByName } from '../helpers/dropCollectionByName.mjs'

const streetSchema = new mongoose.Schema({ name: String })
const Street = mongoose.model('Street', streetSchema)

const citySchema = new mongoose.Schema({ name: String })
const City = mongoose.model('City', citySchema)

const countrySchema = new mongoose.Schema({ name: String })
const Country = mongoose.model('Country', countrySchema)

const addressSchema = new mongoose.Schema({
  street: { type: mongoose.Schema.Types.ObjectId, ref: 'Street' },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' }
})
const Address = mongoose.model('Address', addressSchema)

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }]
})
const User = mongoose.model('user', userSchema)

async function run() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options)
    console.log(chalk.magentaBright('Connected to the database'))

    await dropCollectionByName('users')
    await dropCollectionByName('streets')
    await dropCollectionByName('cities')
    await dropCollectionByName('countries')
    await dropCollectionByName('addresses')

    try {
      const streets = await Street.create({ name: 'Main St' })
      const cities = await City.create({ name: 'Anytown' })
      const countries = await Country.create({ name: 'USA' })

      const address1 = await Address.create({
        street: streets._id,
        city: cities._id,
        country: countries._id
      })

      await User.create([
        { firstName: 'John', lastName: 'Smith', addresses: [address1._id] },
        { firstName: 'Jane', lastName: 'Smith', addresses: [address1._id] }
      ])
      console.log(chalk.greenBright('Users and addresses added to the database'))

      const users = await User.find({}).populate({
        path: 'addresses',
        populate: {
          path: 'street city country'
        }
      })
      console.log(chalk.magentaBright('Search results with populated addresses:'), JSON.stringify(users, null, 2))
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
