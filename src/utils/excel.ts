import XLSX from 'xlsx'
import { RegistroExcelMiembro } from '../src/data'

export function saveToExcel(
  data: (string | number|boolean)[][],
  filename?: string,
  sheetname?: string
) {
  /* convert from array of arrays to workbook */
  var worksheet = XLSX.utils.aoa_to_sheet(data)
  var new_workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(new_workbook, worksheet, sheetname || 'hoja1')
  XLSX.writeFile(
    new_workbook,
    filename ? `${filename}.xlsx` : 'reporte.xlsx'
  )
}


//
export async function workbookToJSON(
  workbook: null | XLSX.WorkBook | undefined
):Promise <RegistroExcelMiembro[]>{
  
var first_sheet_name = (workbook as XLSX.WorkBook).SheetNames[0]; //toma el nombre de la primera hoja de calculo del libro de trabajo


var address_of_cell = 'C2';

/* Get worksheet */
var worksheet = (workbook as XLSX.WorkBook).Sheets[first_sheet_name];

/* Find desired cell */
var desired_cell = worksheet[address_of_cell];

/* Get the value */
var desired_value = (desired_cell ? desired_cell.v : undefined);
var arrWS: RegistroExcelMiembro[]= XLSX.utils.sheet_to_json(worksheet,{dateNF:'yyyy-mm-dd'})
return(arrWS)
}
 
