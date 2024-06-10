const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const imageSchema = new mongoose.Schema({
  imageUrl: String,
  extractedNumber: String,
});

const Image = mongoose.model('Image', imageSchema);

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use(express.json());

app.post('/upload', upload.single('image'), (req, res) => {
  const { path: imagePath } = req.file;

  Tesseract.recognize(imagePath, 'eng')
    .then(({ data: { text } }) => {
      const extractedNumber = text.match(/\d+/g)?.[0] || 'No number found';

      const newImage = new Image({
        imageUrl: imagePath,
        extractedNumber,
      });

      newImage.save()
        .then(() => {
          fs.unlinkSync(imagePath);  // Clean up the uploaded image
          res.json({ extractedNumber });
        })
        .catch(err => res.status(500).json({ error: err.message }));
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
