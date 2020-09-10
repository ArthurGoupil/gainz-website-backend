const express = require('express');
const shortid = require('shortid');
const router = express.Router();
const Paper = require('../models/Paper');

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

// Add a work on paper to DB & upload work on paper picture(s) to Cloudinary
router.post('/papers/add', isAdminAuthenticated, async (req, res) => {
  const filesResults = [];
  const files = [];
  const paperPart = ['first-part', 'second-part', 'third-part'];
  const paperData = {};

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
    paperData.name = name;
    paperData.creationYear = creationYear;
    paperData.format = format;
    paperData.type = type;
    if (format === 'triptyque') {
      paperData.width = width * 3 + 4;
    } else if (format === 'diptyque') {
      paperData.width = paperData.width = width * 2 + 2;
    } else paperData.width = width;
    paperData.height = height;
    if (format !== 'normal') {
      paperData.widthOfEach = width;
      paperData.heightOfEach = height;
    }
    paperData.price = price;
    paperData.isSold = isSold;
    if (isSold) {
      paperData.customer = customer;
      if (sellPriceIsUnknown) paperData.sellPrice = null;
      else paperData.sellPrice = sellPrice;
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
      paperData.previewImage = getCloudinaryUrl(files, 'preview', 'normal');
      paperData.smallImage = getCloudinaryUrl(files, 'small', 'normal');
      paperData.bigImage = getCloudinaryUrl(files, 'big', 'normal');
    } else if (format === 'diptyque') {
      paperData.previewImage = getCloudinaryUrl(files, 'preview', 'diptyque');
      paperData.smallImage = getCloudinaryUrl(files, 'small', 'diptyque');
      paperData.bigImage = getCloudinaryUrl(files, 'big', 'diptyque-first');
      paperData.scndBigImage = getCloudinaryUrl(
        files,
        'big',
        'diptyque-second'
      );
    } else if (format === 'triptyque') {
      paperData.previewImage = getCloudinaryUrl(files, 'preview', 'triptyque');
      paperData.smallImage = getCloudinaryUrl(files, 'small', 'triptyque');
      paperData.bigImage = getCloudinaryUrl(files, 'big', 'triptyque-first');
      paperData.scndBigImage = getCloudinaryUrl(
        files,
        'big',
        'triptyque-second'
      );
      paperData.thrdBigImage = getCloudinaryUrl(
        files,
        'big',
        'triptyque-third'
      );
    } else console.log('Wrong format provided');

    try {
      const paper = new Paper({
        ...paperData,
      });

      await paper.save((error) => {
        if (error) {
          // Duplicate paper name
          if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(422).json({ message: 'paper already exists!' });
          }
          // Some other error
          return res.status(422).json(error);
        } else
          return res.status(200).json({
            message: `Work on paper '${paper.name}' has been created.`,
            data: paper,
          });
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
              folder: 'gainz/papers',
              public_id: `${file.name.slice(
                0,
                file.name.lastIndexOf('.')
              )}_${shortid.generate()}`,
              tags: [paperPart[index]],
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
            folder: 'gainz/papers',
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
