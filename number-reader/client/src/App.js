import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import ImagesList from './components/ImagesList.jsx';
import CameraCapture from './components/CameraCapture.jsx'; // Import the CameraCapture component
import { backend_url } from './server.js';

const App = () => {
  const [image, setImage] = useState(null);
  const [extractedNumber, setExtractedNumber] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = () => {
    if (image) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        axios.post(`${backend_url}/upload`, { image: base64data })
          .then(res => {
            setExtractedNumber(res.data.extractedNumber);
          })
          .catch(err => {
            console.error(err);
          });
      };
    }
  };

  return (
    <div className="App">
      <h1>Number Reader</h1>
      <div>
        <h2>Upload Image</h2>
        <input type="file" onChange={handleImageChange} />
        <button onClick={handleUpload}>Upload</button>
      </div>
      <div>
        <h2>Capture Image</h2>
        <CameraCapture />
      </div>
      {extractedNumber && <h2>Extracted Number: {extractedNumber}</h2>}
      <div>
        <h1>Number Reader Application</h1>
        <ImagesList />
      </div>
    </div>
  );
};

export default App;
