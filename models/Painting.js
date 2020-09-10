const mongoose = require('mongoose');
const shortid = require('shortid');

shortid.characters(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@'
);

const Painting = mongoose.model('Painting', {
  shortId: {
    type: String,
    required: true,
    unique: true,
    default: shortid.generate,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  format: {
    type: String,
    required: true,
    default: 'normal',
    enum: ['normal', 'diptyque', 'triptyque'],
  },
  details: {
    type: String,
  },
  width: {
    type: Number,
    required: true,
  },
  widthOfEach: {
    type: Number,
  },
  height: {
    type: Number,
    required: true,
  },
  heightOfEach: {
    type: Number,
  },
  price: {
    type: Number,
    required: true,
  },
  addDate: {
    type: Date,
    default: Date.now,
  },
  creationYear: {
    type: Number,
    required: true,
  },
  previewImage: {
    type: String,
    required: true,
  },
  smallImage: {
    type: String,
    required: true,
  },
  bigImage: {
    type: String,
    required: true,
  },
  scndBigImage: {
    type: String,
  },
  thrdBigImage: {
    type: String,
  },
  isSold: {
    type: Boolean,
    default: false,
  },
  sellPrice: {
    type: Number,
  },
  customer: {
    type: String,
  },
  isOnHome: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = Painting;
