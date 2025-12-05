"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

interface SemesterSelectorProps {
    semesters: any[]
}

export function SemesterSelector({ semesters }: SemesterSelectorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentTermId = searchParams.get("termId")

    // Find active semester to set default if no param
    const activeSemester = semesters.find(s => s.isActive)
    const defaultValue = currentTermId || (activeSemester ? activeSemester.id : "")

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set("termId", value)
        } else {
            params.delete("termId")
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <Select value={defaultValue} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All History</SelectItem>
                {semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                        {semester.academicYear.name} {semester.type}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
