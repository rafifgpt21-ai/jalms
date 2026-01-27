"use client"

import { useEffect, useState } from "react"
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
import { LearningProfile } from "@/lib/actions/intelligence.actions"
import { AcademicDomain } from "@prisma/client"

interface LearningProfileRadarChartProps {
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

export default function LearningRadarChart({ data }: LearningProfileRadarChartProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

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
    // Non-linear scale implementation:
    // 0-75 score maps to 0-50 radius (compressed)
    // 75-100 score maps to 50-100 radius (expanded)
    const transformScore = (score: number) => {
        if (score <= 75) {
            return score * (50 / 75)
        }
        return 50 + (score - 75) * (50 / 25)
    }

    // Calculate ticks for the axis
    // We want to show lines for 25, 50, 75, 100
    const scoreTicks = [25, 50, 75, 100]
    const radiusTicks = scoreTicks.map(transformScore)

    // Helper to format tick value back to score label
    const formatTick = (value: number) => {
        // Reverse transform for display
        // Though since we know the specific ticks we are plotting, we can perhaps just map them back
        // But Recharts might pass intermediate values if we are not careful.
        // However, with explicit `ticks` prop, it should only call for those.

        // Find closest score tick
        if (value === 0) return "0"

        // Check for our specific tick values with some tolerance for float precision
        if (Math.abs(value - transformScore(25)) < 0.1) return "25"
        if (Math.abs(value - transformScore(50)) < 0.1) return "50"
        if (Math.abs(value - 50) < 0.1) return "75"
        if (Math.abs(value - 100) < 0.1) return "100"

        return ""
    }

    const allTypes = Object.keys(DOMAIN_LABELS) as AcademicDomain[]
    const chartData = allTypes.map(type => {
        const found = data.find(d => d.domain === type)
        const score = found ? found.score : 0
        return {
            subject: DOMAIN_LABELS[type],
            score: score,
            visualScore: transformScore(score),
            fullMark: 100
        }
    })

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Learning Profile Radar</CardTitle>
                <CardDescription>
                    Visual representation of your performance across different academic domains.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 100]}
                                ticks={radiusTicks as any}
                                tick={false}
                                axisLine={false}
                            />
                            <Radar
                                name="Score"
                                dataKey="visualScore"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                            />
                            <Tooltip
                                formatter={(value: any, name: any, props: any) => {
                                    // Can access the original score from payload
                                    const originalScore = props.payload.score;
                                    return [originalScore, name];
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
