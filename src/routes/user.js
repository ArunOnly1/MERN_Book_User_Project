const express = require('express')
const debug = require('debug')('userRoute')
const bcrypt = require('bcrypt')

const { User, validationSchema } = require('../model/User')
const { validateRequest } = require('../middlewares/validateRequest')
const auth = require('../middlewares/auth')

const router = express.Router()

router.post('/users', validateRequest(validationSchema), async (req, res) => {
  try {
    const newUser = new User(req.body)
    const token = await newUser.generateAuthToken()
    // debug('token', token)
    const savedUser = await newUser.save()
    // debug('saveduser', savedUser)
    res.status(201).send({ status: 'Success', savedUser, token })
  } catch (error) {
    res.status(500).send({ status: 'Failed', error: error.message })
  }
})

router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find()
    if (users.length < 1) {
      throw new Error('No users found')
    }
    res.status(200).send({ status: 'Success', users })
  } catch (error) {
    res.status(500).send({ status: 'Failed', error: error.message })
  }
})

router.get('/users/me', auth, (req, res) => {
  res.status(200).send({ status: 'Success', user: req.user })
})

router.patch(
  '/users/me',
  [validateRequest(validationSchema), auth],
  async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
      res.status(400).send({ status: 'Failed', message: 'Invalid fields' })
    }
    try {
      const oldUser = req.user
      updates.forEach((update) => (oldUser[update] = req.body[update]))

      const updatedUser = await oldUser.save()
      if (!updatedUser) {
        throw new Error()
      }
      res.status(200).send({ status: 'success', updatedUser })
    } catch (error) {
      res.status(500).send({ status: 'Failed', error: error.message })
    }
  }
)

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    )
    await req.user.save()
    res.status(200).send({ message: 'Logged out' })
  } catch (error) {
    res.status(500).send({ status: 'Failed', error: error.message })
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res
      .status(200)
      .send({ status: 'success', message: 'Logged out of all device' })
  } catch (error) {
    res.status(500).send({ status: 'Failed', error: error.message })
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findByCredentials(email, password)
    const token = await user.generateAuthToken()
    res.status(200).send({ status: 'Success', user, token })
  } catch (error) {
    res.status(500).send({ status: 'Failed', error: error.message })
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    const deletedUser = await req.user.remove()
    if (!deletedUser) {
      throw new Error('Cannot delete the user')
    }
    res.status(200).send({ status: 'success', deletedUser })
  } catch (error) {
    res.status(500).send({ status: 'Failed', error: error.message })
  }
})
module.exports = router
