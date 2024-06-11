import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

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
        rowData={images}
        domLayout='autoHeight'
        columnDefs={columnDefs}
        defaultColDef={{
          flex: 1,
          minWidth: 150,
          resizable: true,
        }}
      >
      </AgGridReact>
    </div>
  );
};

export default ImagesList;
