import XLSX from 'xlsx'


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


 
