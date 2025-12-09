"use client"

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { IntelligenceProfile } from "@/lib/actions/intelligence.actions"
import { IntelligenceType } from "@prisma/client"

interface IntelligenceRadarChartProps {
    data: IntelligenceProfile[]
}

const INTELLIGENCE_LABELS: Record<IntelligenceType, string> = {
    LINGUISTIC: "Linguistic",
    LOGICAL_MATHEMATICAL: "Logic/Math",
    SPATIAL: "Spatial",
    BODILY_KINESTHETIC: "Kinesthetic",
    MUSICAL: "Musical",
    INTERPERSONAL: "Interpersonal",
    INTRAPERSONAL: "Intrapersonal",
    NATURALIST: "Naturalist",
    EXISTENTIAL: "Existential",
}

export function IntelligenceRadarChart({ data }: IntelligenceRadarChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Learning Profile Radar</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available.
                </CardContent>
            </Card>
        )
    }

    // Transform data for Recharts
    // Ensure all axes are present even if score is 0
    const allTypes = Object.keys(INTELLIGENCE_LABELS) as IntelligenceType[]
    const chartData = allTypes.map(type => {
        const found = data.find(d => d.type === type)
        return {
            subject: INTELLIGENCE_LABELS[type],
            score: found ? found.score : 0,
            fullMark: 100
        }
    })

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Learning Profile Radar</CardTitle>
                <CardDescription>
                    Visual representation of your performance across different intelligence types.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="50%" data={chartData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar
                                name="Score"
                                dataKey="score"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                            />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
