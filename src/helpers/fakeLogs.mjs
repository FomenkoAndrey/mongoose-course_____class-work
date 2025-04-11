import { faker } from '@faker-js/faker'

export const logs = Array.from({ length: 1000 }, (_, i) => {
  return {
    message: faker.lorem.sentence(),
    createdAt: new Date(Date.now() + i * 50)
  }
})
