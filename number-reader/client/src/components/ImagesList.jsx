import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
//import CustomCellRender from './Grid/CustomCellRenderer'

const ImagesList = () => {
  const [images, setImages] = useState([]);
 // Column Definitions: Defines the columns to be displayed.
 const columnDefs = [
    { field: "imageNo", headerName: "imageNo"  },
    { field: "previousExtractedNumber", headerName: "previousExtractedNumber" },
    { field: "extractedNumber", headerName: "nextextractedNumber" },
    { field: "differenceExtractedNumber", headerName: "differenceExtractedNumber" },
    { field: "createdAt", headerName: "createdAt" },
  ];
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/images');
        setImages(response.data);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="ag-theme-alpine" style={{ height: '400px', width: '100%' }}>
      <AgGridReact
        rowData={images.map(image => ({
          ...image,
          previousExtractedNumber: (image.previousExtractedNumber != null) ? `${image.previousExtractedNumber} km` : '0 km',
          extractedNumber: `${image.extractedNumber} km`,
          differenceExtractedNumber: (image.differenceExtractedNumber != null) ? `${image.differenceExtractedNumber} km` : '0 km',
          createdAt: new Date(image.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }))}
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
