// import React, { useState, useRef } from 'react';
// import axios from 'axios';
// import ReactCrop from 'react-image-crop';
// import 'react-image-crop/dist/ReactCrop.css';

// const CameraCapture = () => {
//   const [src, setSrc] = useState(null);
//   const [crop, setCrop] = useState({ aspect: 16 / 9 });
//   const imgRef = useRef(null);

//   const captureImage = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       const videoTrack = stream.getVideoTracks()[0];
//       const imageCapture = new ImageCapture(videoTrack);
//       const blob = await imageCapture.takePhoto();
//       const imageUrl = URL.createObjectURL(blob);
//       setSrc(imageUrl);
//     } catch (error) {
//       console.error('Error capturing image:', error);
//     }
//   };

//   const onCropComplete = crop => {
//     makeClientCrop(crop);
//   };

//   const makeClientCrop = async crop => {
//     if (imgRef.current && crop.width && crop.height) {
//       const croppedImageUrl = await getCroppedImg(imgRef.current, crop, 'newFile.jpeg');
//       setSrc(croppedImageUrl);
//     }
//   };

//   const getCroppedImg = (image, crop, fileName) => {
//     const canvas = document.createElement('canvas');
//     const scaleX = image.naturalWidth / image.width;
//     const scaleY = image.naturalHeight / image.height;
//     canvas.width = crop.width;
//     canvas.height = crop.height;
//     const ctx = canvas.getContext('2d');

//     ctx.drawImage(
//       image,
//       crop.x * scaleX,
//       crop.y * scaleY,
//       crop.width * scaleX,
//       crop.height * scaleY,
//       0,
//       0,
//       crop.width,
//       crop.height
//     );

//     return new Promise((resolve, reject) => {
//       canvas.toBlob(blob => {
//         if (!blob) {
//           console.error('Canvas is empty');
//           return;
//         }
//         blob.name = fileName;
//         window.URL.revokeObjectURL(src);
//         const imageUrl = window.URL.createObjectURL(blob);
//         resolve(imageUrl);
//       }, 'image/jpeg');
//     });
//   };

//   const uploadImage = async () => {
//     if (!src) return;

//     const formData = new FormData();
//     formData.append('image', src);

//     try {
//       await axios.post('http://localhost:5000/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
//       console.log('Image uploaded successfully');
//     } catch (error) {
//       console.error('Error uploading image:', error);
//     }
//   };

//   return (
//     <div>
//       <button onClick={captureImage}>Capture Image</button>
//       {src && (
//         <div>
//           <ReactCrop
//             src={src}
//             crop={crop}
//             onChange={newCrop => setCrop(newCrop)}
//             onComplete={onCropComplete}
//           />
//           <button onClick={uploadImage}>Upload Image</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CameraCapture;
// src/components/CameraCapture.jsx
// import React, { useState, useRef } from 'react';
// import Webcam from 'react-webcam';
// import ReactCrop from 'react-image-crop';
// import 'react-image-crop/dist/ReactCrop.css';
// import axios from 'axios';

// const CameraCapture = () => {
//   const webcamRef = useRef(null);
//   const [imgSrc, setImgSrc] = useState(null);
//   const [crop, setCrop] = useState({ aspect: 1 });
//   const [croppedImage, setCroppedImage] = useState(null);

//   const capture = () => {
//     const imageSrc = webcamRef.current.getScreenshot();
//     setImgSrc(imageSrc);
//   };

//   const onCropComplete = (crop) => {
//     if (imgSrc && crop.width && crop.height) {
//       const canvas = document.createElement('canvas');
//       const image = new Image();
//       image.src = imgSrc;
//       const scaleX = image.naturalWidth / image.width;
//       const scaleY = image.naturalHeight / image.height;
//       canvas.width = crop.width;
//       canvas.height = crop.height;
//       const ctx = canvas.getContext('2d');
//       ctx.drawImage(
//         image,
//         crop.x * scaleX,
//         crop.y * scaleY,
//         crop.width * scaleX,
//         crop.height * scaleY,
//         0,
//         0,
//         crop.width,
//         crop.height
//       );
//       canvas.toBlob(blob => {
//         setCroppedImage(blob);
//       }, 'image/jpeg');
//     }
//   };

//   const handleUpload = () => {
//     if (croppedImage) {
//       const formData = new FormData();
//       formData.append('image', croppedImage, 'captured_image.jpg');

//       axios.post('http://localhost:5000/upload', formData)
//         .then(res => {
//           console.log('Upload successful', res.data);
//         })
//         .catch(err => {
//           console.error(err);
//         });
//     }
//   };

//   return (
//     <div>
//       <Webcam
//         audio={false}
//         ref={webcamRef}
//         screenshotFormat="image/jpeg"
//         width="30%"
//         height="30%"
//       />
//       <button onClick={capture}>Capture</button>
//       {imgSrc && (
//         <>
//           <ReactCrop
//             src={imgSrc}
//             crop={crop}
//             onChange={newCrop => setCrop(newCrop)}
//             onComplete={onCropComplete}
//           />
//           <button onClick={handleUpload}>Upload Cropped Image</button>
//         </>
//       )}
//     </div>
//   );
// };

// export default CameraCapture;
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import axios from 'axios';

const CameraCapture = () => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [crop, setCrop] = useState({ aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  };

  const createImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (err) => reject(err));
      img.src = url;
    });
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
      }, 'image/jpeg');
    }
  };

  useEffect(() => {
    if (completedCrop) {
      onCropComplete(completedCrop);
    }
  }, [completedCrop]);

  const handleUpload = () => {
    if (croppedImage) {
      const formData = new FormData();
      formData.append('image', croppedImage, 'captured_image.jpg');

      axios.post('http://localhost:5000/upload', formData)
        .then(res => {
          console.log('Upload successful', res.data);
        })
        .catch(err => {
          console.error(err);
        });
    }
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{ width: '10%', height: 'auto' }}
      />
      <button onClick={capture}>Capture</button>
      {imgSrc && (
        <>
          <ReactCrop
            src={imgSrc}
            crop={crop}
            onChange={newCrop => setCrop(newCrop)}
            onComplete={newCrop => setCompletedCrop(newCrop)}
          />
          <button onClick={handleUpload}>Upload Cropped Image</button>
        </>
      )}
    </div>
  );
};

export default CameraCapture;
