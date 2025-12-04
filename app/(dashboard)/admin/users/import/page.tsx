"use client"

import { useState } from "react"
import { read, utils, writeFile, write } from "xlsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ImportUsersPage() {
    const [data, setData] = useState<any[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<any>(null)
    const router = useRouter()

    const generateTemplate = () => {
        const wb = utils.book_new()

        // Sheet 1: Template
        const templateData = [
            { Name: "John Doe", Email: "john@example.com", Roles: "STUDENT", Password: "password123", ID: "123456" },
            { Name: "Jane Smith", Email: "jane@example.com", Roles: "SUBJECT_TEACHER, HOMEROOM_TEACHER", Password: "password123", ID: "789012" }, // Multi-role example
            { Name: "", Email: "", Roles: "", Password: "", ID: "" } // Empty row for user input
        ]
        const wsTemplate = utils.json_to_sheet(templateData)

        // Set column widths
        wsTemplate["!cols"] = [
            { wch: 20 }, // Name
            { wch: 25 }, // Email
            { wch: 35 }, // Roles (wider for multiple roles)
            { wch: 15 }, // Password
            { wch: 15 }  // ID
        ]

        utils.book_append_sheet(wb, wsTemplate, "Template")

        // Sheet 2: Guide
        const guideData = [
            ["Column", "Description", "Required"],
            ["Name", "Full name of the user", "Yes"],
            ["Email", "Unique email address", "Yes"],
            ["Roles", "Comma-separated roles (see below)", "No (Default: STUDENT)"],
            ["Password", "Initial password", "Yes"],
            ["ID", "Official ID (NIS/NIP)", "No"],
            [],
            ["Multiple Roles", "Description"],
            ["Format", "You can assign multiple roles by separating them with commas."],
            ["Example", "SUBJECT_TEACHER, HOMEROOM_TEACHER"],
            [],
            ["Valid Roles", "Description"],
            ["ADMIN", "Administrator with full access"],
            ["SUBJECT_TEACHER", "Teacher assigned to subjects"],
            ["HOMEROOM_TEACHER", "Teacher assigned to a class"],
            ["STUDENT", "Student"],
            ["PARENT", "Parent account"]
        ]
        const wsGuide = utils.aoa_to_sheet(guideData)

        // Set column widths for guide
        wsGuide["!cols"] = [{ wch: 20 }, { wch: 40 }, { wch: 15 }]

        utils.book_append_sheet(wb, wsGuide, "Guide")

        // Download file
        const wbout = write(wb, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([wbout], { type: 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "user_import_template.xlsx"
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (evt) => {
            const bstr = evt.target?.result
            const wb = read(bstr, { type: "binary" })
            const wsname = wb.SheetNames[0] // Assume data is in the first sheet
            const ws = wb.Sheets[wsname]
            const jsonData = utils.sheet_to_json(ws)

            // Map keys to match API expectations (lowercase, specific names)
            const mappedData = jsonData.map((row: any) => ({
                name: row.Name || row.name,
                email: row.Email || row.email,
                roles: row.Roles || row.roles,
                password: row.Password || row.password,
                officialId: row.ID || row.id || row.officialId // Map ID column to officialId
            }))

            setData(mappedData)
        }
        reader.readAsBinaryString(file)
    }

    const processImport = async () => {
        setIsUploading(true)
        try {
            const res = await fetch("/api/admin/users/import", {
                method: "POST",
                body: JSON.stringify({ users: data }),
            })
            const result = await res.json()
            setUploadStatus(result)
            if (result.success > 0) {
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            setUploadStatus({ failed: data.length, errors: ["Network error"] })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Import Users</h1>
                <Button variant="outline" onClick={generateTemplate}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Download Template
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Upload Excel File</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">.XLSX or .CSV</p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" accept=".xlsx, .csv" onChange={handleFileUpload} />
                        </label>
                    </div>
                </CardContent>
            </Card>

            {data.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Preview & Process ({data.length} users)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="max-h-64 overflow-auto border rounded">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Roles</TableHead>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Password</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.slice(0, 10).map((row: any, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>{row.email}</TableCell>
                                            <TableCell>{row.roles}</TableCell>
                                            <TableCell>{row.officialId}</TableCell>
                                            <TableCell>******</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {data.length > 10 && <p className="text-xs text-center p-2 text-muted-foreground">...and {data.length - 10} more</p>}
                        </div>

                        {uploadStatus ? (
                            <div className={`p-4 rounded-md ${uploadStatus.failed === 0 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                                <div className="flex items-center gap-2 font-semibold">
                                    {uploadStatus.failed === 0 ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                                    Import Completed
                                </div>
                                <p className="text-sm mt-1">
                                    Successfully imported: {uploadStatus.success} <br />
                                    Failed: {uploadStatus.failed}
                                </p>
                                {uploadStatus.errors.length > 0 && (
                                    <ul className="list-disc list-inside text-xs mt-2 text-red-600">
                                        {uploadStatus.errors.slice(0, 5).map((e: string, i: number) => <li key={i}>{e}</li>)}
                                    </ul>
                                )}
                                <Button className="mt-4" onClick={() => router.push("/admin/users")}>Go to User List</Button>
                            </div>
                        ) : (
                            <Button onClick={processImport} disabled={isUploading} className="w-full">
                                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isUploading ? "Processing..." : "Process Import"}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
