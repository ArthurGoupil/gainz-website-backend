const express = require('express');
const shortid = require('shortid');
const router = express.Router();
const Painting = require('../models/Painting');

const isAdminAuthenticated = require('../middleware/isAdminAuthenticated');

const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'goupil',
  api_key: '654369122393577',
  api_secret: 'kJffNbslYOF7UCnOo24giZYZSE8',
});

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
      isSold: 1,
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

router.post('/paintings/add', isAdminAuthenticated, (req, res) => {
  const filesResults = [];
  const files = [];
  const artPart = ['first-part', 'second-part', 'third-part'];

  if (req.files.firstImage) files.push(req.files.firstImage);
  if (req.files.secondImage) files.push(req.files.secondImage);
  if (req.files.thirdImage) files.push(req.files.thirdImage);

  try {
    if (typeof files === 'object') {
      if (files.length > 1) {
        files.forEach((file, index) => {
          cloudinary.v2.uploader.upload(
            file.path,
            {
              folder: 'gainz/paintings',
              public_id: `${file.name.slice(
                0,
                file.name.lastIndexOf('.')
              )}_${shortid.generate()}`,
              tags: [artPart[index]],
            },
            (error, result) => {
              if (error) {
                return res.status(400).json({ error });
              } else {
                filesResults.push({
                  path: `${result.public_id}.${result.format}`,
                  ratio: result.height / result.width,
                  height: (result.width * result.height) / result.width,
                  result,
                });
              }
              if (filesResults.length === files.length) {
                return res.status(200).json(filesResults);
              }
            }
          );
        });
      } else {
        cloudinary.v2.uploader.upload(
          files[0].path,
          {
            folder: 'gainz/paintings',
            public_id: `${files[0].name.slice(
              0,
              files[0].name.lastIndexOf('.')
            )}_${shortid.generate()}`,
          },
          (error, result) => {
            if (error) {
              return res.status(400).json({ error });
            } else {
              filesResults.push({
                path: `${result.public_id}.${result.format}`,
                ratio: result.height / result.width,
                height: (result.width * result.height) / result.width,
              });
            }

            return res.status(200).json(filesResults);
          }
        );
      }
    }
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Add a painting
router.post('/paintings/create', isAdminAuthenticated, async (req, res) => {
  try {
    const painting = new Painting({
      shortId: shortid.generate(),
      ...req.fields,
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
