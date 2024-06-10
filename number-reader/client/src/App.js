import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [image, setImage] = useState(null);
  const [extractedNumber, setExtractedNumber] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append('image', image);

    axios.post('/upload', formData)
      .then(res => {
        setExtractedNumber(res.data.extractedNumber);
      })
      .catch(err => {
        console.error(err);
      });
  };

  return (
    <div className="App">
      <h1>Number Reader</h1>
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleUpload}>Upload</button>
      {extractedNumber && <h2>Extracted Number: {extractedNumber}</h2>}
    </div>
  );
};

export default App;
