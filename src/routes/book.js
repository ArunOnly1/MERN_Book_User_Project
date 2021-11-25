const express = require('express')
const debug = require('debug')('bookroute')

const { Book, validationSchema } = require('../model/Book')
const { validateRequest } = require('../middlewares/validateRequest')
const auth = require('../middlewares/auth')

const router = express.Router()

router.post(
  '/books',
  [validateRequest(validationSchema), auth],
  async (req, res) => {
    try {
      const book = { ...req.body, owner: req.user._id }
      const newBook = new Book(book)
      const savedBook = await newBook.save()
      if (!savedBook) {
        throw new Error()
      }
      res.status(201).send({ status: 'success', savedBook })
    } catch (error) {
      res.status(500).send({ status: 'Failed', error: error.message })
    }
  }
)

router.get('/books/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const book = await Book.findOne({
      _id: id,
      owner: req.user._id,
    })

    if (!book) {
      throw new Error('Cannot find Book')
    }
    res.status(200).send({ status: 'Success', book })
  } catch (error) {
    res.status(500).send({ status: 'Failed', error: error.message })
  }
})

router.get('/books', auth, async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id })
    if (books.length < 1) {
      throw new Error()
    }
    res.status(200).send({ status: 'success', books })
  } catch (error) {
    res.status(500).send({ status: 'Failed', error: error.message })
  }
})

router.patch(
  '/books/:id',
  [validateRequest(validationSchema), auth],
  async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'isPublished', 'price']
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
      res.status(400).send({ status: 'Invalid request' })
    }
    try {
      const { id } = req.params
      let oldBook = await Book.findById(id)

      if (!oldBook) {
        throw new Error('No books found')
      }

      updates.forEach((update) => (oldBook[update] = req.body[update]))

      // !Ask Pradeep dai for this functionality
      // if (req.body.isPublished === false) {
      //   debug('inside')
      //   const newOldBook = oldBook.toObject()
      //   delete newOldBook.price
      //   oldBook = newOldBook
      // }

      const updatedBook = await oldBook.save()
      if (!updatedBook) {
        throw new Error('Update failed')
      }
      res.status(200).send({ status: 'Success', updatedBook })
    } catch (error) {
      res.status(500).send({ status: 'Failed', error: error.message })
    }
  }
)

router.delete('/books/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params
    const book = await Book.findOne({ _id: id, owner: req.user._id })
    const deletedBook = await book.remove()
    res.status(200).send({ status: 'Deleted Successfully', deletedBook })
  } catch (error) {
    res.status(500).send({ status: 'Failed', error: error.message })
  }
})
module.exports = router
