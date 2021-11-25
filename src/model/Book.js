const mongoose = require('mongoose')
const yup = require('yup')

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 255,
  },
  isPublished: {
    type: Boolean,
    required: true,
  },
  price: {
    type: Number,
    min: 1,
    required: function () {
      return this.isPublished
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
})

const validationSchema = yup.object().shape({
  name: yup.string().required().min(4).max(255).trim(),
  isPublished: yup.boolean().required(),
  price: yup.number().min(1),
})

const Book = mongoose.model('Book', bookSchema)
module.exports = { Book, validationSchema }
