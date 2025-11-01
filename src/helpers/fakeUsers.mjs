import { faker } from '@faker-js/faker'
import { getRandomSkills } from './skillsData.mjs'

export const users = Array.from({ length: 100 }, () => {
  return {
    person: {
      first: faker.person.firstName(),
      last: faker.person.lastName()
    },
    email: faker.internet.email(),
    age: faker.number.int({ min: 18, max: 60 }),
    skills: getRandomSkills(),
    city: faker.location.city(),
    orders: {
      product: faker.commerce.product(),
      count: faker.number.int({ min: 1, max: 10 })
    }
  }
})
