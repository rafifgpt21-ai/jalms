"use client"

import { useState, useEffect } from "react"
import { GradingScale, getGradingScaleDefaults, updateGradingScaleDefaults } from "@/lib/actions/system-config.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

export function GradingScaleForm() {
    const [scale, setScale] = useState<GradingScale[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadDefaults()
    }, [])

    async function loadDefaults() {
        setLoading(true)
        const res = await getGradingScaleDefaults()
        if (res.error) {
            toast.error(res.error)
        } else if (res.scale) {
            setScale(res.scale)
        }
        setLoading(false)
    }

    const handleChange = (index: number, field: 'min' | 'max', value: string) => {
        const newScale = [...scale]
        newScale[index] = { ...newScale[index], [field]: parseInt(value) || 0 }
        setScale(newScale)
    }

    async function onSave() {
        setSaving(true)
        // Validation: Ensure ranges don't overlap? For now, trust admin.
        // Ensure Max > Min
        for (const s of scale) {
            if (s.min > s.max) {
                toast.error(`Invalid range for Grade ${s.grade}: Min cannot be greater than Max`)
                setSaving(false)
                return
            }
        }

        const res = await updateGradingScaleDefaults(scale)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Grading scale updated successfully")
        }
        setSaving(false)
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Default Grading Scale</CardTitle>
                <CardDescription>
                    Set the default score ranges for letter grades. These defaults will be applied to new courses.
                    Subject teachers can customize the competency descriptions for these ranges.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    {scale.map((item, index) => (
                        <div key={item.grade} className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-2 font-bold text-center text-lg bg-slate-100 dark:bg-slate-800 py-2 rounded-md">
                                {item.grade}
                            </div>
                            <div className="col-span-10 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Minimum Score</Label>
                                    <Input
                                        type="number"
                                        value={item.min}
                                        onChange={(e) => handleChange(index, 'min', e.target.value)}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Maximum Score</Label>
                                    <Input
                                        type="number"
                                        value={item.max}
                                        onChange={(e) => handleChange(index, 'max', e.target.value)}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={onSave} disabled={saving}>
                        {saving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                        {!saving && <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
