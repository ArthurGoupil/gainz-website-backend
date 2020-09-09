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

// Add a paint to DB & upload paint picture(s) to Cloudinary
router.post('/paintings/add', isAdminAuthenticated, async (req, res) => {
  const filesResults = [];
  const files = [];
  const paintPart = ['first-part', 'second-part', 'third-part'];
  const paintData = {};

  const { firstImage, secondImage, thirdImage } = req.files;

  const { name, type, format, customer } = req.fields;

  const creationYear = JSON.parse(req.fields.creationYear);
  const width = JSON.parse(req.fields.width);
  const height = JSON.parse(req.fields.height);
  const price = JSON.parse(req.fields.price);
  const isSold = JSON.parse(req.fields.isSold);
  const sellPrice = JSON.parse(req.fields.sellPrice);
  const sellPriceIsUnknown = JSON.parse(req.fields.sellPriceIsUnknown);

  if (firstImage) files.push(firstImage);
  if (secondImage) files.push(secondImage);
  if (thirdImage) files.push(thirdImage);

  const addArtToDataBase = async (files) => {
    // Building data for request
    paintData.name = name;
    paintData.creationYear = creationYear;
    paintData.format = format;
    paintData.type = type;
    if (format === 'triptyque') {
      paintData.width = width * 3 + 4;
    } else if (format === 'diptyque') {
      paintData.width = paintData.width = width * 2 + 2;
    } else paintData.width = width;
    paintData.height = height;
    if (format !== 'normal') {
      paintData.widthOfEach = width;
      paintData.heightOfEach = height;
    }
    paintData.price = price;
    paintData.isSold = isSold;
    if (isSold) {
      paintData.customer = customer;
      if (sellPriceIsUnknown) paintData.sellPrice = null;
      else paintData.sellPrice = sellPrice;
    }

    // Building imgs URLs
    const getCloudinaryUrl = (files, size, format) => {
      const firstPart = files.find(
        (file) => file.part === 'only-part' || file.part === 'first-part'
      );
      const secondPart = files.find((file) => file.part === 'second-part');
      const thirdPart = files.find((file) => file.part === 'third-part');
      let url;
      switch (size) {
        case 'preview':
          const previewHeight = Math.round(50 * firstPart.ratio);
          switch (format) {
            case 'normal':
              url = `https://res.cloudinary.com/goupil/image/upload/t_gainz-preview/${firstPart.path}`;
              break;
            case 'diptyque':
              url = `https://res.cloudinary.com/goupil/image/upload/c_scale,h_${previewHeight},w_102/c_scale,g_west,l_${firstPart.transformationsPath},w_50,h_${previewHeight}/c_scale,g_east,l_${secondPart.transformationsPath},w_50,h_${previewHeight}/gainz/format-background_hjr0dn.png`;
              break;
            case 'triptyque':
              url = `https://res.cloudinary.com/goupil/image/upload/c_scale,h_${previewHeight},w_153/c_scale,g_west,l_${firstPart.transformationsPath},w_50,h_${previewHeight}/c_scale,l_${secondPart.transformationsPath},w_50,h_${previewHeight}/c_scale,g_east,l_${thirdPart.transformationsPath},w_50,h_${previewHeight}/gainz/format-background_hjr0dn.png`;
              break;
            default:
              console.log('Wrong format provided');
          }
          break;
        case 'small':
          const smallHeight = Math.round(500 * firstPart.ratio);
          switch (format) {
            case 'normal':
              url = `https://res.cloudinary.com/goupil/image/upload/t_gainz-small/${firstPart.path}`;
              break;
            case 'diptyque':
              url = `https://res.cloudinary.com/goupil/image/upload/c_scale,h_${smallHeight},w_1015/c_scale,g_west,l_${firstPart.transformationsPath},w_500,h_${smallHeight}/c_scale,g_east,l_${secondPart.transformationsPath},w_500,h_${smallHeight}/gainz/format-background_snazfq.jpg`;
              break;
            case 'triptyque':
              url = `https://res.cloudinary.com/goupil/image/upload/c_scale,h_${smallHeight},w_1530/c_scale,g_west,l_${firstPart.transformationsPath},w_500,h_${smallHeight}/c_scale,l_${secondPart.transformationsPath},w_500,h_${smallHeight}/c_scale,g_east,l_${thirdPart.transformationsPath},w_500,h_${smallHeight}/gainz/format-background_hjr0dn.png`;
              break;
            default:
              console.log('Wrong format provided');
          }
          break;
        case 'big':
          switch (format) {
            case 'normal':
              url = `https://res.cloudinary.com/goupil/image/upload/t_gainz-big/${firstPart.path}`;
              break;
            case 'diptyque-first':
              url = `https://res.cloudinary.com/goupil/image/upload/t_gainz-big/${firstPart.path}`;
              break;
            case 'diptyque-second':
              url = `https://res.cloudinary.com/goupil/image/upload/t_gainz-big/${secondPart.path}`;
              break;
            case 'triptyque-first':
              url = `https://res.cloudinary.com/goupil/image/upload/t_gainz-big/${firstPart.path}`;
              break;
            case 'triptyque-second':
              url = `https://res.cloudinary.com/goupil/image/upload/t_gainz-big/${secondPart.path}`;
              break;
            case 'triptyque-third':
              url = `https://res.cloudinary.com/goupil/image/upload/t_gainz-big/${thirdPart.path}`;
              break;
            default:
              console.log('Wrong format provided');
          }
          break;
        default:
          console.log('Wrong size provided');
      }
      return url;
    };

    if (format === 'normal') {
      paintData.previewImage = getCloudinaryUrl(files, 'preview', 'normal');
      paintData.smallImage = getCloudinaryUrl(files, 'small', 'normal');
      paintData.bigImage = getCloudinaryUrl(files, 'big', 'normal');
    } else if (format === 'diptyque') {
      paintData.previewImage = getCloudinaryUrl(files, 'preview', 'diptyque');
      paintData.smallImage = getCloudinaryUrl(files, 'small', 'diptyque');
      paintData.bigImage = getCloudinaryUrl(files, 'big', 'diptyque-first');
      paintData.scndBigImage = getCloudinaryUrl(
        files,
        'big',
        'diptyque-second'
      );
    } else if (format === 'triptyque') {
      paintData.previewImage = getCloudinaryUrl(files, 'preview', 'triptyque');
      paintData.smallImage = getCloudinaryUrl(files, 'small', 'triptyque');
      paintData.bigImage = getCloudinaryUrl(files, 'big', 'triptyque-first');
      paintData.scndBigImage = getCloudinaryUrl(
        files,
        'big',
        'triptyque-second'
      );
      paintData.thrdBigImage = getCloudinaryUrl(
        files,
        'big',
        'triptyque-third'
      );
    } else console.log('Wrong format provided');

    try {
      const painting = new Painting({
        ...paintData,
      });
      await painting.save();
      return res.status(200).json({
        message: `Painting '${painting.name}' has been created.`,
        data: painting,
      });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  };

  // Uploading picture(s)
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
              tags: [paintPart[index]],
            },
            (error, result) => {
              if (error) {
                return res.status(400).json({ error });
              } else {
                filesResults.push({
                  path: `${result.public_id}.${result.format}`,
                  transformationsPath: `${result.public_id.replace(
                    /\//g,
                    ':'
                  )}`,
                  ratio: result.height / result.width,
                  height: (result.width * result.height) / result.width,
                  part: result.tags[0],
                });
              }
              if (filesResults.length === files.length) {
                addArtToDataBase(filesResults);
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
            tags: 'only-part',
          },
          (error, result) => {
            if (error) {
              return res.status(400).json({ error });
            } else {
              filesResults.push({
                path: `${result.public_id}.${result.format}`,
                ratio: result.height / result.width,
                height: (result.width * result.height) / result.width,
                part: result.tags[0],
              });
              addArtToDataBase(filesResults);
            }
          }
        );
      }
    }
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

module.exports = router;
