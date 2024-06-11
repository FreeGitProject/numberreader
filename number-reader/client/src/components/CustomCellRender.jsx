// src/components/CustomCellRender.jsx
import React from 'react';

const CustomCellRender = (props) => {
  const { value, colDef } = props;
  
  let displayValue = value;
  
  if (colDef.field === 'createdAt') {
    displayValue = new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (colDef.field === 'previousExtractedNumber' || colDef.field === 'extractedNumber' || colDef.field === 'differenceExtractedNumber') {
    displayValue = value != null ? `${value} km` : '0 km';
  }

  return <span>{displayValue}</span>;
};

export default CustomCellRender;
