const express = require('express');
const shortid = require('shortid');
const router = express.Router();
const Paper = require('../models/Paper');

const isAdminAuthenticated = require('../middleware/isAdminAuthenticated');

shortid.characters(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@'
);

// Route used to add shortid to previously added papers
// router.post('/papers/shortid', async (req, res) => {
//   try {
//     const papers = await Paper.find();
//     for (let i = 0; i < papers.length; i++) {
//       await Paper.updateOne(
//         { _id: papers[i]._id },
//         { $set: { shortId: shortid.generate() } }
//       );
//     }
//     return res.status(200).json(papers);
//   } catch (e) {
//     return res.status(400).json({ error: e.message });
//   }
// });

// Get all papers
router.get('/papers', async (req, res) => {
  try {
    const paper = await Paper.find({ isDeleted: false }).sort({
      creationYear: -1,
      name: 1,
    });
    return res.status(200).json(paper);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Get paper with id
router.get('/papers/:shortId', async (req, res) => {
  const shortId = req.params.shortId;
  try {
    const paper = await Paper.findOne({ shortId });
    return res.status(200).json(paper);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Add a paper
router.post('/papers/create', isAdminAuthenticated, async (req, res) => {
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
    } = req.fields;
    const paper = new Paper({
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
    });
    await paper.save();
    return res
      .status(200)
      .json({ message: `Paper '${paper.name}' has been created.` });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

module.exports = router;
