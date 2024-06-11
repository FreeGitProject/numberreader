// Base Imports
import React from 'react';

// Package Imports
import { ICellRendererParams } from 'ag-grid-community';
import { format } from 'date-fns'

const CustomCellRenderer: React.FC<ICellRendererParams> = (params) => {

    if(params.colDef?.field=="countryName"){
     return (
            <span> {params.value}  ({params.data.currencyCode}) </span>
        );
    }
    if(params.colDef?.field=="currencyCode"){
        return (
               <span> {params.value}  ({params.data.currencySymbol}) </span>
           );
       }
   
       if(params.colDef?.field=="isGlobal"){
            if(params.value){
                return (
                    <span> Yes </span>
                );
            }
            else{
                return (
                    <span> No </span>
                );
            }
       }

       if(params.colDef?.field=="isDefault"){
            if(params.value){
                return (
                    <span> Yes </span>
                );
            }
            else{
                return (
                    <span> No </span>
                );
            }
       }

       if(params.colDef?.field=="isActive"){
            if(params.value){
                return (
                    <span> Yes </span>
                );
            }
            else{
                return (
                    <span> No </span>
                );
            }
       }

       if(params.colDef?.field=="createdAt"){
            const formattedDate =params.value ? format( new Date(params.value),"yyyy-dd-MM HH:mm")  : "";

            return (
                <span>
                    {formattedDate}
                </span>
            );
       }
       if(params.colDef?.field=="endDate"){
        const formattedDate =params.value ? format( new Date(params.value),"yyyy-dd-MM HH:mm")  : "";

        return (
            <span>
                {formattedDate}
            </span>
        );
   }
      
    return params.value;
};

export default CustomCellRenderer;