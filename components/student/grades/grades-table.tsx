"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface GradesTableProps {
    grades: any[]
    semesterTitle: string
}

export function GradesTable({ grades, semesterTitle }: GradesTableProps) {
    const [excludeAttendance, setExcludeAttendance] = useState(false)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <CardTitle>{semesterTitle} Grades</CardTitle>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="exclude-attendance"
                        checked={excludeAttendance}
                        onCheckedChange={setExcludeAttendance}
                    />
                    <Label htmlFor="exclude-attendance">Exclude Attendance</Label>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Teacher</TableHead>
                            <TableHead className="hidden md:table-cell">Attendance</TableHead>
                            <TableHead className="text-right">Overall Grade</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grades && grades.length > 0 ? (
                            grades.map((grade: any) => {
                                let displayGrade = grade.grade

                                if (excludeAttendance && grade.breakdown) {
                                    const { studentPoints, maxPointsPossible, extraCreditPoints } = grade.breakdown
                                    const numerator = studentPoints + extraCreditPoints
                                    const denominator = maxPointsPossible

                                    let calculatedGrade = 0
                                    if (denominator > 0) {
                                        calculatedGrade = (numerator / denominator) * 100
                                    } else {
                                        // Fallback if no max points possible (e.g. no assignments yet)
                                        // If we exclude attendance and there are no assignments, what should it be?
                                        // Arguably 100 or 0. Let's keep it consistent with default logic = 100.
                                        calculatedGrade = 100
                                    }
                                    displayGrade = Math.round(Math.min(calculatedGrade, 100) * 10) / 10
                                }

                                return (
                                    <TableRow key={grade.courseId}>
                                        <TableCell className="font-medium">{grade.courseName}</TableCell>
                                        <TableCell>{grade.teacherName}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <Progress value={grade.attendancePercentage} className="w-[60px]" />
                                                <span className="text-xs text-muted-foreground">{grade.attendancePercentage}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={`text-lg font-bold ${displayGrade >= 90 ? 'text-green-600' :
                                                displayGrade >= 80 ? 'text-blue-600' :
                                                    displayGrade >= 70 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {displayGrade}%
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                    No grades found for this semester.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
