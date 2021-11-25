const debug = require('debug')('validateRequest')

exports.validateRequest = (validationSchema) => async (req, res, next) => {
  try {
    const validatedUser = await validationSchema.validate(req.body)
    req.body = validatedUser
    next()
  } catch (error) {
    res.status(403).send({ status: 'Failed', error: error.message })
  }
}
