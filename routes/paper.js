const express = require("express");
const router = express.Router();
const Paper = require("../models/Paper");

// Get all pa
router.get("/papers", async (req, res) => {
  try {
    const paper = await Paper.find({ isDeleted: false });
    return res.status(200).json(paper);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Get paper with id
router.get("/papers/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const paper = await Paper.findById(id);
    return res.status(200).json(paper);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Add a paper
router.post("/papers/create", async (req, res) => {
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
      smallImage,
      bigImage,
      scndBigImage,
      thrdBigImage,
      isSold,
      sellPrice,
      customer,
      creationYear
    } = req.fields;
    const paper = new Paper({
      name,
      type,
      format,
      details,
      width,
      widthOfEach,
      height,
      heightOfEach,
      price,
      smallImage,
      scndBigImage,
      thrdBigImage,
      bigImage,
      isSold,
      sellPrice,
      customer,
      creationYear
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
