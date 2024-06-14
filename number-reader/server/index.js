const express = require('express');
const mongoose = require('mongoose');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

// Image Upload and Processing Route
app.post('/upload', async (req, res) => {
  const imageBuffer = Buffer.from(req.body.image, 'base64');
  const processedImagePath = `./uploads/processed-${Date.now()}.png`;

  try {
    const count = await Image.countDocuments();
    const imageNo = count + 1;
    const previousImage = await Image.findOne({}, {}, { sort: { 'createdAt': -1 } });

    sharp(imageBuffer)
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

            cloudinary.uploader.upload(processedImagePath, { folder: "number_reader" })
              .then(result => {
                const newImage = new Image({
                  imageUrl: result.secure_url,
                  extractedNumber: extractedNumber.toString(),
                  imageNo,
                  differenceExtractedNumber,
                  previousExtractedNumber: oldExtractedNumber?.toString(),
                });

                newImage.save()
                  .then(() => {
                    fs.unlinkSync(processedImagePath);
                    res.json({ extractedNumber, imageNo, differenceExtractedNumber, oldExtractedNumber });
                  })
                  .catch(err => res.status(500).json({ error: err.message }));
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
