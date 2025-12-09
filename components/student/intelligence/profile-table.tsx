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
import { IntelligenceProfile } from "@/lib/actions/intelligence.actions"
import { IntelligenceType } from "@prisma/client"

interface IntelligenceProfileTableProps {
    data: IntelligenceProfile[]
}

const INTELLIGENCE_LABELS: Record<IntelligenceType, string> = {
    LINGUISTIC: "Linguistic-Verbal",
    LOGICAL_MATHEMATICAL: "Logical-Mathematical",
    SPATIAL: "Visual-Spatial",
    BODILY_KINESTHETIC: "Bodily-Kinesthetic",
    MUSICAL: "Musical-Rhythmic",
    INTERPERSONAL: "Interpersonal",
    INTRAPERSONAL: "Intrapersonal",
    NATURALIST: "Naturalist",
    EXISTENTIAL: "Existential",
}

const INTELLIGENCE_DESCRIPTIONS: Record<IntelligenceType, string> = {
    LINGUISTIC: "Sensitivity to spoken and written language, ability to learn languages, and capacity to use language to accomplish certain goals.",
    LOGICAL_MATHEMATICAL: "Capacity to analyze problems logically, carry out mathematical operations, and investigate issues scientifically.",
    SPATIAL: "Potential to recognize and use the patterns of wide space and more confined areas.",
    BODILY_KINESTHETIC: "Potential of using one's whole body or parts of the body to solve problems.",
    MUSICAL: "Skill in the performance, composition, and appreciation of musical patterns.",
    INTERPERSONAL: "Capacity to understand the intentions, motivations and desires of other people.",
    INTRAPERSONAL: "Capacity to understand oneself, to appreciate one's feelings, fears and motivations.",
    NATURALIST: "Ability to recognize, categorize and draw upon certain features of the environment.",
    EXISTENTIAL: "Sensitivity and capacity to tackle deep questions about human existence.",
}

export function IntelligenceProfileTable({ data }: IntelligenceProfileTableProps) {
    // Sort by score desc
    const sortedData = [...data].sort((a, b) => b.score - a.score)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
                <CardDescription>
                    Your average scores and activity count for each intelligence type.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Intelligence Type</TableHead>
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
                                <TableRow key={item.type}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{INTELLIGENCE_LABELS[item.type]}</span>
                                            {/* Mobile description */}
                                            <span className="md:hidden text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {INTELLIGENCE_DESCRIPTIONS[item.type]}
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
                                        {INTELLIGENCE_DESCRIPTIONS[item.type]}
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
