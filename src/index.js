const express = require('express')
const dotenv = require('dotenv')
const debug = require('debug')('index')

const db_connect = require('./db/db_connect')
const userRouter = require('./routes/user')
const bookRouter = require('./routes/book')
dotenv.config()
db_connect()

const app = express()
app.use(express.json())

app.use(userRouter)
app.use(bookRouter)
const port = process.env.PORT || 3000
app.listen(port, () => {
  debug(`Listening on port ${port}`)
})
