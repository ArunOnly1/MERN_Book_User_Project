const debug = require('debug')('auth')
const jwt = require('jsonwebtoken')
const { User } = require('../model/User')

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const { _id } = jwt.verify(token, 'thisistestapp')
    const user = await User.findOne({ _id, 'tokens.token': token })
    if (!user) {
      throw new Error()
    }
    req.token = token
    req.user = user
    next()
  } catch (error) {
    res.status(401).send({ status: 'Failed', error: 'Please authenticate ' })
  }
}

module.exports = auth
