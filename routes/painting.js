const express = require("express");
const router = express.Router();
const Painting = require("../models/Painting");

// Get all paintings
router.get("/paintings", async (req, res) => {
  try {
    const paintings = await Painting.find({ isDeleted: false });
    return res.status(200).json(paintings);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Get home paintings
router.get("/paintings/home", async (req, res) => {
  try {
    const paintingsSrc = [];
    const paintings = await Painting.find({ isDeleted: false, isOnHome: true });
    paintings.forEach(painting => {
      paintingsSrc.push(painting.smallImage);
    });
    return res.status(200).json(paintingsSrc);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Get painting with id
router.get("/paintings/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const painting = await Painting.findById(id);
    return res.status(200).json(painting);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Add a painting
router.post("/paintings/create", async (req, res) => {
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
      creationYear,
      isOnHome
    } = req.fields;
    const painting = new Painting({
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
      creationYear,
      isOnHome
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
