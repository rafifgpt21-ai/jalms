import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const data = [
    { name: "John Doe", email: "john@example.com", password: "password123", roles: "Student" },
    { name: "Jane Smith", email: "jane@example.com", password: "securepass", roles: "Teacher, Subject_Teacher" },
    { name: "Admin User", email: "admin2@jalms.com", password: "adminpass", roles: "Admin" }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Users");

const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
const publicDir = path.join(process.cwd(), "public");

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

fs.writeFileSync(path.join(publicDir, "users_template.xlsx"), buffer);
console.log("Template created!");
