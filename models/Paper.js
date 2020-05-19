const mongoose = require('mongoose');

const Paper = mongoose.model('Paper', {
  shortId: {
    type: String,
    required: true,
    unique: true,
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
    default: '',
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
  },
  addDate: {
    type: Date,
    default: new Date(),
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
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = Paper;
