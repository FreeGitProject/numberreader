import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css';
import axios from 'axios';
import backend_url from '../server'

const CameraCapture = () => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [crop, setCrop] = useState({ aspect: 16 / 9 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    setIsCameraOn(false); // Turn off the camera after capturing
    console.log("Captured Image Source:", imageSrc); // Debug log
  };

  const onCropComplete = async (crop) => {
    if (imgSrc && crop.width && crop.height) {
      const image = await createImage(imgSrc);
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
      canvas.toBlob(blob => {
        setCroppedImage(blob);
        const croppedUrl = URL.createObjectURL(blob);
        setCroppedImageUrl(croppedUrl);
        console.log("Cropped Image URL:", croppedUrl); // Debug log
      }, 'image/jpeg');
    }
  };

  const createImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (err) => reject(err));
      img.src = url;
    });
  };

  const handleUpload = () => {
    if (croppedImage) {
      const formData = new FormData();
      formData.append('image', croppedImage, 'captured_image.jpg');
      axios.post(`${backend_url}/upload`, formData)
        .then(res => {
          console.log('Upload successful', res.data);
        })
        .catch(err => {
          console.error(err);
        });
    }
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  useEffect(() => {
    console.log('Crop state:', crop);
  }, [crop]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          {/* Button to toggle camera */}
          <button onClick={toggleCamera}>
            {isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
          </button>
          {/* Conditionally render the Webcam component */}
          {isCameraOn && (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              style={{ width: '20%', height: 'auto' }}
            />
          )}
          {/* Button to capture image */}
          {isCameraOn && (
            <button onClick={capture}>Capture</button>
          )}
        </div>

        {/* Display captured image and cropping tool */}
        {imgSrc && (
          <div>
            <h3>Captured Image</h3>
            {/* <img src={imgSrc} alt="Captured" style={{ maxWidth: '100%' }} /> */}
            {/* <ReactCrop
              src={imgSrc}
              //crop={crop}
              // onChange={(newCrop) => setCrop(newCrop)}
              // onComplete={(newCrop) => {
              //   setCompletedCrop(newCrop);
              //   onCropComplete(newCrop);
              // }}
            /> */}
      <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={onCropComplete}>
              <img src={imgSrc} alt="Captured" />
            </ReactCrop>
            {/* Display cropped image preview */}
            {croppedImageUrl && (
              <div>
                <h3>Cropped Image Preview</h3>
                <img src={croppedImageUrl} alt="Cropped" style={{ maxWidth: '100%' }} />
                {/* Button to upload cropped image */}
                <button onClick={handleUpload}>Upload Cropped Image</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
