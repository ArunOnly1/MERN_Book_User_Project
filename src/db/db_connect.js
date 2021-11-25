const mongoose = require('mongoose')
const debug = require('debug')('mongoose')

const db_connect = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    debug('Connected to DB')
  } catch (error) {
    debug(error)
  }
}

module.exports = db_connect
