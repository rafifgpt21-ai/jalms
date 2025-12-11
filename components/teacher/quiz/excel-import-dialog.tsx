"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { bulkCreateQuestions } from "@/lib/actions/quiz.actions"
import { toast } from "sonner"
import { Loader2, Upload, FileSpreadsheet } from "lucide-react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"

interface ExcelImportDialogProps {
    quizId: string
}

export function ExcelImportDialog({ quizId }: ExcelImportDialogProps) {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleImport = async () => {
        if (!file) {
            toast.error("Please select a file")
            return
        }

        startTransition(async () => {
            try {
                const reader = new FileReader()

                reader.onload = async (e) => {
                    const data = e.target?.result
                    if (!data) return

                    const workbook = XLSX.read(data, { type: "binary" })
                    const sheetName = workbook.SheetNames[0]
                    const sheet = workbook.Sheets[sheetName]
                    const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

                    // Process Data
                    // Column Index 0: Question
                    // Column Indices 1-6: Choices 1-6
                    // Column Index 7: Correct Answer Index (1-based) OR Text

                    const questions = []

                    // Skip header row if it seems like a header
                    const startRow = (typeof jsonData[0]?.[0] === 'string' && jsonData[0][0].toLowerCase().includes('question')) ? 1 : 0

                    for (let i = startRow; i < jsonData.length; i++) {
                        const row = jsonData[i]
                        const questionText = row[0]
                        if (!questionText) continue

                        const choicesRaw = row.slice(1, 7).filter(c => c !== undefined && c !== null && String(c).trim() !== "")
                        const correctAnswerRaw = row[7]

                        if (choicesRaw.length < 2) continue // Skip invalid questions

                        // Determine correct answer index
                        let correctIndex = -1
                        if (typeof correctAnswerRaw === 'number') {
                            correctIndex = correctAnswerRaw - 1 // Assume 1-based index
                        } else if (typeof correctAnswerRaw === 'string') {
                            // Try to match text
                            correctIndex = choicesRaw.findIndex(c => String(c).trim().toLowerCase() === correctAnswerRaw.trim().toLowerCase())

                            // If still formatting "Answer: 1" or similar
                            if (correctIndex === -1 && /^\d$/.test(correctAnswerRaw)) {
                                correctIndex = parseInt(correctAnswerRaw) - 1
                            }
                        }

                        // Fallback: If generic, default to 0 (first option) but warn? No, better safe than sorry.
                        if (correctIndex < 0 || correctIndex >= choicesRaw.length) {
                            correctIndex = 0 // Default to first for safety, user can edit
                        }

                        const choices = choicesRaw.map((text, idx) => ({
                            text: String(text),
                            isCorrect: idx === correctIndex,
                            order: idx
                        }))

                        questions.push({
                            text: String(questionText),
                            order: i, // Temp order
                            choices
                        })
                    }

                    if (questions.length === 0) {
                        toast.error("No valid questions found in file")
                        return
                    }

                    const result = await bulkCreateQuestions(quizId, questions as any)
                    if (result.error) {
                        toast.error(result.error)
                    } else {
                        toast.success(`Imported ${questions.length} questions successfully`)
                        setOpen(false)
                        setFile(null)
                        router.refresh()
                    }
                }

                reader.readAsBinaryString(file)

            } catch (error) {
                console.error("Import error:", error)
                toast.error("Failed to parse Excel file")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Import from Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Questions</DialogTitle>
                    <DialogDescription>
                        Upload an Excel file (.xlsx) to bulk import questions.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>File</Label>
                        <Input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md space-y-1">
                        <p className="font-medium">File Format Guide:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Column 1: Question Text</li>
                            <li>Column 2-7: Choices (min 2, max 6)</li>
                            <li>Column 8: Correct Answer (Number 1-6 or Exact Text)</li>
                        </ul>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleImport} disabled={isPending || !file}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
