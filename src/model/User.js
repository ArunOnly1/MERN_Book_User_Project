const mongoose = require('mongoose')
const yup = require('yup')
const debug = require('debug')('UserModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { Book } = require('./Book')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [3, 'Username must be atleast 3 characters'],
    maxlength: 255,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
    min: [1, 'Age cannot be less than 1'],
    max: 150,
  },
  password: {
    type: String,
    min: 4,
    max: 25,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
})

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, 'thisistestapp')
  user.tokens.push({ token })
  //   debug('from function', user)
  await user.save()
  return token
}

userSchema.methods.toJSON = function () {
  const user = this
  //   debug('User from TOJSON', user)
  const userObject = user.toObject()
  delete userObject.tokens
  delete userObject.password
  // debug('userObject', userObject)
  return userObject
}

userSchema.statics.findByCredentials = async function (email, password) {
  try {
    const user = await User.findOne({ email })
    // debug('user from statics', user)
    if (!user) {
      throw new Error()
    }
    const isMatch = bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new Error()
    }
    return user
  } catch (error) {
    throw new Error('Unable to login')
  }
}

userSchema.pre('save', async function (next) {
  const user = this
  debug('user from pre', user)
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

userSchema.pre('remove', async function (next) {
  const user = this
  await Book.deleteMany({ owner: user._id })
  next()
})

const User = mongoose.model('User', userSchema)

const validationSchema = yup.object().shape({
  name: yup.string().required().min(3).max(255).trim(),
  age: yup.number().required().min(1).max(150),
  email: yup.string().email().required(true).lowercase().trim(),
  password: yup.string().required().min(4).max(25),
})
module.exports = { User, validationSchema }
