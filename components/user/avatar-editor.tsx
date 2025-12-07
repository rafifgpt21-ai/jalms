"use client"

import { useState, useMemo, useEffect } from "react"
import { createAvatar } from "@dicebear/core"
import { funEmoji } from "@dicebear/collection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Loader2, RefreshCw, Save } from "lucide-react"
import { toast } from "sonner"
import { updateUserAvatar } from "@/lib/actions/user.actions"
import { useRouter } from "next/navigation"

type AvatarConfig = {
    seed: string
    eyes?: string[]
    mouth?: string[]
    backgroundColor?: string[]
    scale?: number
    translateX?: number
    translateY?: number
}

const defaultOptions: AvatarConfig = {
    seed: "jalms",
    eyes: ["plain"],
    mouth: ["plain"],
    backgroundColor: ["b6e3f4"],
    scale: 100,
    translateX: 0,
    translateY: 0,
}

export function AvatarEditor({ initialConfig, onSaved }: { initialConfig?: any, onSaved?: () => void }) {
    const [config, setConfig] = useState<AvatarConfig>(initialConfig || defaultOptions)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const avatarSvg = useMemo(() => {
        return createAvatar(funEmoji, {
            ...config,
            size: 128,
        } as any).toString()
    }, [config])

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`
            const result = await updateUserAvatar(config, dataUri)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Avatar updated successfully")
                router.refresh()
                onSaved?.()
            }
        } catch (error) {
            toast.error("Failed to update avatar")
        } finally {
            setIsLoading(false)
        }
    }

    const randomize = () => {
        const eyesOptions = getOptions("eyes")
        const mouthOptions = getOptions("mouth")
        const bgOptions = getOptions("backgroundColor")

        setConfig(prev => ({
            ...prev,
            seed: Math.random().toString(36).substring(7),
            eyes: [eyesOptions[Math.floor(Math.random() * eyesOptions.length)]],
            mouth: [mouthOptions[Math.floor(Math.random() * mouthOptions.length)]],
            backgroundColor: [bgOptions[Math.floor(Math.random() * bgOptions.length)]],
        }))
    }

    const updateConfig = (key: keyof AvatarConfig, value: any) => {
        setConfig(prev => ({
            ...prev,
            [key]: (key === 'scale' || key === 'translateX' || key === 'translateY') ? value : [value]
        }))
    }

    // Helper to generate options for select inputs
    const getOptions = (key: string) => {
        const options: Record<string, string[]> = {
            eyes: ["sad", "tearDrop", "pissed", "cute", "wink", "wink2", "plain", "glasses", "closed", "love", "stars", "shades", "closed2", "crying", "sleepClose"],
            mouth: ["plain", "lilSmile", "sad", "shy", "cute", "wideSmile", "shout", "smileTeeth", "smileLol", "pissed", "drip", "tongueOut", "kissHeart", "sick", "faceMask"],
            backgroundColor: ["fcbc34", "d84be5", "d9915b", "f6d594", "059ff2", "71cf62", "b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
        }
        return options[key] || []
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Avatar Editor</CardTitle>
                <CardDescription>Customize your avatar without uploading a file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div
                        className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/10"
                        dangerouslySetInnerHTML={{ __html: avatarSvg }}
                    />
                    <Button variant="outline" size="sm" onClick={randomize}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Randomize
                    </Button>
                </div>

                <Tabs defaultValue="face" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="face">Face</TabsTrigger>
                        <TabsTrigger value="background">Background</TabsTrigger>
                        <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
                    </TabsList>

                    <TabsContent value="face" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Eyes</Label>
                            <Select onValueChange={(v) => updateConfig("eyes", v)} value={config.eyes?.[0] || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select eyes" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getOptions("eyes").map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Mouth</Label>
                            <Select onValueChange={(v) => updateConfig("mouth", v)} value={config.mouth?.[0] || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select mouth" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getOptions("mouth").map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    <TabsContent value="background" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Background Color</Label>
                            <div className="grid grid-cols-6 gap-2">
                                {getOptions("backgroundColor").map(color => (
                                    <button
                                        key={color}
                                        className={`w-8 h-8 rounded-full border-2 ${config.backgroundColor?.[0] === color ? 'border-primary' : 'border-transparent'}`}
                                        style={{ backgroundColor: `#${color}` }}
                                        onClick={() => updateConfig("backgroundColor", color)}
                                        aria-label={`Select color ${color}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="adjustments" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Scale</Label>
                                <span className="text-sm text-muted-foreground">{config.scale || 100}%</span>
                            </div>
                            <Slider
                                defaultValue={[config.scale || 100]}
                                max={200}
                                step={10}
                                onValueChange={(vals) => updateConfig("scale", vals[0])}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Horizontal Position (X)</Label>
                                <span className="text-sm text-muted-foreground">{config.translateX || 0}%</span>
                            </div>
                            <Slider
                                defaultValue={[config.translateX || 0]}
                                min={-100}
                                max={100}
                                step={5}
                                onValueChange={(vals) => updateConfig("translateX", vals[0])}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Vertical Position (Y)</Label>
                                <span className="text-sm text-muted-foreground">{config.translateY || 0}%</span>
                            </div>
                            <Slider
                                defaultValue={[config.translateY || 0]}
                                min={-100}
                                max={100}
                                step={5}
                                onValueChange={(vals) => updateConfig("translateY", vals[0])}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    Save Avatar
                </Button>
            </CardFooter>
        </Card>
    )
}
