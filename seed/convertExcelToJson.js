// convertExcelToJson.js (run once, then delete)
import XLSX from "xlsx";
import fs from "fs";

const wb = XLSX.readFile("DISH_INFO.xlsx");
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

fs.writeFileSync(
  "dish_seed.json",
  JSON.stringify(data, null, 2)
);

console.log("Converted to dish_seed.json");
