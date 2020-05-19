const express = require('express');
const shortid = require('shortid');
const router = express.Router();
const Painting = require('../models/Painting');

const isAdminAuthenticated = require('../middleware/isAdminAuthenticated');

shortid.characters(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@'
);

// Route used to add shortid to previously added paintings
// router.post('/paintings/shortid', async (req, res) => {
//   try {
//     const paintings = await Painting.find();
//     for (let i = 0; i < paintings.length; i++) {
//       await Painting.updateOne(
//         { _id: paintings[i]._id },
//         { $set: { shortId: shortid.generate() } }
//       );
//     }
//     return res.status(200).json(paintings);
//   } catch (e) {
//     return res.status(400).json({ error: e.message });
//   }
// });

// Get all paintings
router.get('/paintings', async (req, res) => {
  try {
    const paintings = await Painting.find({ isDeleted: false }).sort({
      creationYear: -1,
      name: 1,
    });
    return res.status(200).json(paintings);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Get home paintings
router.get('/paintings/home', async (req, res) => {
  try {
    const paintingsSrc = [];
    const paintings = await Painting.find({ isDeleted: false, isOnHome: true });
    paintings.forEach((painting) => {
      paintingsSrc.push({
        smallImage: painting.smallImage,
        previewImage: painting.previewImage,
      });
    });
    return res.status(200).json(paintingsSrc);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Get painting with id
router.get('/paintings/:shortId', async (req, res) => {
  const shortId = req.params.shortId;
  try {
    const painting = await Painting.findOne({ shortId });
    return res.status(200).json(painting);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Add a painting
router.post('/paintings/create', isAdminAuthenticated, async (req, res) => {
  try {
    const {
      name,
      type,
      format,
      details,
      width,
      widthOfEach,
      height,
      heightOfEach,
      price,
      previewImage,
      smallImage,
      bigImage,
      scndBigImage,
      thrdBigImage,
      isSold,
      sellPrice,
      customer,
      creationYear,
      isOnHome,
    } = req.fields;
    const painting = new Painting({
      shortId: shortid.generate(),
      name,
      type,
      format,
      details,
      width,
      widthOfEach,
      height,
      heightOfEach,
      price,
      previewImage,
      smallImage,
      scndBigImage,
      thrdBigImage,
      bigImage,
      isSold,
      sellPrice,
      customer,
      creationYear,
      isOnHome,
    });
    await painting.save();
    return res
      .status(200)
      .json({ message: `Painting '${painting.name}' has been created.` });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

module.exports = router;
