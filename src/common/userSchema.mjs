import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    person: {
      first: String,
      last: String
    },
    email: String,
    age: Number,
    skills: [String],
    city: String,
    orders: {
      product: String,
      count: Number
    }
  },
  {
    timestamps: true
  }
)

userSchema.index({ '$**': 'text' })

export const User = mongoose.model('User', userSchema)
