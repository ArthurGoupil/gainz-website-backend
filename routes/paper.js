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
      isSold: 1,
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

module.exports = router;
