"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LearningProfile } from "@/lib/actions/intelligence.actions"
import { AcademicDomain } from "@prisma/client"

interface LearningProfileTableProps {
    data: LearningProfile[]
}

const DOMAIN_LABELS: Record<AcademicDomain, string> = {
    SCIENCE_TECHNOLOGY: "Science and Technology",
    SOCIAL_HUMANITIES: "Social Sciences and Humanities",
    LANGUAGE_COMMUNICATION: "Language and Communication",
    ARTS_CREATIVITY: "Arts and Creativity",
    PHYSICAL_EDUCATION: "Physical Education",
    SPIRITUALITY_ETHICS: "Spirituality & Ethics",
}

const DOMAIN_DESCRIPTIONS: Record<AcademicDomain, string> = {
    SCIENCE_TECHNOLOGY: "Fokus: Logika, analisis data, dan pemecahan masalah teknis.",
    SOCIAL_HUMANITIES: "Fokus: Pemahaman struktur sosial, memori naratif, dan empati.",
    LANGUAGE_COMMUNICATION: "Fokus: Kemampuan artikulasi, literasi, dan ekspresi ide.",
    ARTS_CREATIVITY: "Fokus: Imajinasi, kreativitas, dan motorik halus.",
    PHYSICAL_EDUCATION: "Fokus: Koordinasi fisik, ketahanan, dan sportivitas.",
    SPIRITUALITY_ETHICS: "Fokus: Pengembangan spiritual, etika, dan nilai-nilai moral.",
}

export function LearningProfileTable({ data }: LearningProfileTableProps) {
    // Sort by score desc
    const sortedData = [...data].sort((a, b) => b.score - a.score)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
                <CardDescription>
                    Your average scores and activity count for each domain.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Academic Domain</TableHead>
                            <TableHead className="w-[150px]">Average Score</TableHead>
                            <TableHead className="w-[100px] text-right">Activities</TableHead>
                            <TableHead className="hidden md:table-cell">Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No data available.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedData.map((item) => (
                                <TableRow key={item.domain}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{DOMAIN_LABELS[item.domain]}</span>
                                            {/* Mobile description */}
                                            <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {DOMAIN_DESCRIPTIONS[item.domain]}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <span className="text-sm font-medium">{item.score}%</span>
                                            <Progress value={item.score} className="h-2" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="secondary">{item.count}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                        {DOMAIN_DESCRIPTIONS[item.domain]}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
