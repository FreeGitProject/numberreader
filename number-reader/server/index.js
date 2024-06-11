const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Import the cors package

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Mongoose Schema and Model
const imageSchema = new mongoose.Schema({
  imageUrl: String,
  extractedNumber: String,
  previousExtractedNumber: String,
  createdAt: { type: Date, default: Date.now },
  imageNo: Number,
  differenceExtractedNumber: Number,
});

const Image = mongoose.model('Image', imageSchema);

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use(express.json());

// Image Upload and Processing Route
app.post('/upload', upload.single('image'), async (req, res) => {
  const { path: imagePath } = req.file;
  const processedImagePath = `./uploads/processed-${Date.now()}.png`;

  try {
    const count = await Image.countDocuments();
    const imageNo = count + 1;
    const previousImage = await Image.findOne({}, {}, { sort: { 'createdAt': -1 } });

    sharp(imagePath)
      .grayscale()
      .normalize()
      .toFile(processedImagePath)
      .then(() => {
        Tesseract.recognize(processedImagePath, 'eng')
          .then(({ data: { text } }) => {
            console.log('Raw OCR Output:', text);

            const extractedNumber = parseInt(text.replace(/\D/g, ''), 10);
            console.log('Extracted Number:', extractedNumber);

            let differenceExtractedNumber = null;
            let oldExtractedNumber = null;

            if (previousImage) {
              const previousExtractedNumber = parseInt(previousImage.extractedNumber, 10);
              differenceExtractedNumber = extractedNumber - previousExtractedNumber;
              oldExtractedNumber = previousExtractedNumber;
            }

            const newImage = new Image({
              imageUrl: processedImagePath,
              extractedNumber: extractedNumber.toString(),
              imageNo,
              differenceExtractedNumber,
              previousExtractedNumber: oldExtractedNumber?.toString(),
            });

            newImage.save()
              .then(() => {
                fs.unlinkSync(imagePath);
                fs.unlinkSync(processedImagePath);
                res.json({ extractedNumber, imageNo, differenceExtractedNumber, oldExtractedNumber });
              })
              .catch(err => res.status(500).json({ error: err.message }));
          })
          .catch(err => res.status(500).json({ error: err.message }));
      })
      .catch(err => res.status(500).json({ error: err.message }));
  } catch (err) {
    console.error('Error during image processing:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add this new route to fetch all images
app.get('/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
