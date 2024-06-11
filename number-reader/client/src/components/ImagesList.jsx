import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import CustomCellRender from './CustomCellRender';

const ImagesList = () => {
  const [images, setImages] = useState([]);

  const columnDefs = [
    { field: "imageNo", headerName: "Image No" },
    { field: "previousExtractedNumber", headerName: "Previous Extracted Number", cellRenderer: CustomCellRender },
    { field: "extractedNumber", headerName: "Extracted Number", cellRenderer: CustomCellRender},
    { field: "differenceExtractedNumber", headerName: "Difference Extracted Number", cellRenderer: CustomCellRender },
    { field: "createdAt", headerName: "Created At", cellRenderer: CustomCellRender },
  ];

  const formatImageData = (image) => ({
    ...image,
    previousExtractedNumber: image.previousExtractedNumber != null ? image.previousExtractedNumber : 0,
    extractedNumber: image.extractedNumber != null ? image.extractedNumber : 0,
    differenceExtractedNumber: image.differenceExtractedNumber != null ? image.differenceExtractedNumber : 0,
  });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/images');
        const formattedImages = response.data.map(formatImageData);
        setImages(formattedImages);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="ag-theme-alpine" style={{ height: '400px', width: '100%' }}>
      <AgGridReact
        rowData={images}
        domLayout='autoHeight'
        columnDefs={columnDefs}
        defaultColDef={{
          flex: 1,
          minWidth: 150,
          resizable: true,
        }}
      />
    </div>
  );
};

export default ImagesList;
