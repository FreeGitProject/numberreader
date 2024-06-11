const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const app = express();
const port = process.env.PORT || 5000;
// Log the MongoDB URI to verify it's being read correctly
//console.log('MongoDB URI:', process.env.MONGO_URI); 

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const imageSchema = new mongoose.Schema({
  imageUrl: String,
  extractedNumber: String,
  previousExtractedNumber: String,
  createdAt: { type: Date, default: Date.now },
  imageNo: Number,
  differenceExtractedNumber:Number,
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

app.post('/upload', upload.single('image'), async (req, res) => {
  const { path: imagePath } = req.file;

  // Preprocess the image
  const processedImagePath = `./uploads/processed-${Date.now()}.png`;

  try {
    // Calculate imageNo
    //const count = await Image.countDocuments({}, { timeout: 30000 });
    const count = await Image.countDocuments();
    const imageNo = count + 1;

    // Find previous image
    const previousImage = await Image.findOne({}, {}, { sort: { 'createdAt': -1 } });

    sharp(imagePath)
      .grayscale()
      .normalize()
      .toFile(processedImagePath)
      .then(() => {
        Tesseract.recognize(processedImagePath, 'eng')
          .then(({ data: { text } }) => {
            console.log('Raw OCR Output:', text); // Log the raw text

            // Extract only numbers
            const extractedNumber = parseInt(text.replace(/\D/g, ''), 10);

            console.log('Extracted Number:', extractedNumber); // Log the extracted number

            let differenceExtractedNumber = null;
            let oldextractedNumber = null;
            if (previousImage) {
              const previousExtractedNumber = parseInt(previousImage.extractedNumber, 10);
              differenceExtractedNumber = extractedNumber - previousExtractedNumber;
               oldextractedNumber = previousExtractedNumber;
            }

            const newImage = new Image({
              imageUrl: processedImagePath,
              extractedNumber: extractedNumber.toString(),
              imageNo,
              differenceExtractedNumber,
              previousExtractedNumber : oldextractedNumber.toString(),
            });

            newImage.save()
              .then(() => {
                fs.unlinkSync(imagePath);  // Clean up the uploaded image
                fs.unlinkSync(processedImagePath);  // Clean up the processed image
                res.json({ extractedNumber, imageNo, differenceExtractedNumber,oldextractedNumber });
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
