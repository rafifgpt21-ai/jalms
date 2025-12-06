"use client"

import { useState, useMemo, useEffect } from "react"
import { createAvatar } from "@dicebear/core"
import { avataaars } from "@dicebear/collection"
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
    top?: string[]
    hairColor?: string[]
    hatColor?: string[]
    accessories?: string[]
    accessoriesColor?: string[]
    facialHair?: string[]
    facialHairColor?: string[]
    clothes?: string[]
    clothesColor?: string[]
    eyes?: string[]
    eyebrows?: string[]
    mouth?: string[]
    skinColor?: string[]
}

const defaultOptions: AvatarConfig = {
    seed: "felix",
}

export function AvatarEditor({ initialConfig }: { initialConfig?: any }) {
    const [config, setConfig] = useState<AvatarConfig>(initialConfig || defaultOptions)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const avatarSvg = useMemo(() => {
        return createAvatar(avataaars, {
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
            }
        } catch (error) {
            toast.error("Failed to update avatar")
        } finally {
            setIsLoading(false)
        }
    }

    const randomize = () => {
        setConfig(prev => ({
            ...prev,
            seed: Math.random().toString(36).substring(7)
        }))
    }

    const updateConfig = (key: keyof AvatarConfig, value: any) => {
        setConfig(prev => ({
            ...prev,
            [key]: [value]
        }))
    }

    // Helper to generate options for select inputs
    const getOptions = (key: string) => {
        // This is a simplified list. In a real app, you might want to pull these from the collection metadata if available,
        // or define a comprehensive list of valid values for 'avataaars'.
        // For now, I'll hardcode some common ones for demonstration.
        const options: Record<string, string[]> = {
            top: ["longHair", "shortHair", "eyepatch", "hat", "hijab", "turban", "winterHat1", "winterHat2", "winterHat3"],
            accessories: ["kurt", "prescription01", "prescription02", "round", "sunglasses", "wayfarers"],
            hairColor: ["auburn", "black", "blonde", "brown", "pastelPink", "platinum", "red", "silverGray"],
            clothes: ["blazerAndShirt", "blazerAndSweater", "collarAndSweater", "graphicShirt", "hoodie", "overall", "shirtCrewNeck", "shirtScoopNeck", "shirtVNeck"],
            eyes: ["close", "cry", "default", "dizzy", "eyeRoll", "happy", "hearts", "side", "squint", "surprised", "wink", "winkWacky"],
            mouth: ["concerned", "default", "disbelief", "eating", "grimace", "sad", "scream", "serious", "smile", "tongue", "twinkle", "vomit"],
            skinColor: ["tanned", "yellow", "pale", "light", "brown", "darkBrown", "black"],
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

                <Tabs defaultValue="head" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="head">Head</TabsTrigger>
                        <TabsTrigger value="face">Face</TabsTrigger>
                        <TabsTrigger value="clothes">Clothes</TabsTrigger>
                        <TabsTrigger value="accessories">Extras</TabsTrigger>
                    </TabsList>

                    <TabsContent value="head" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Top / Hair</Label>
                            <Select onValueChange={(v) => updateConfig("top", v)} value={config.top?.[0] || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select style" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getOptions("top").map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Hair Color</Label>
                            <Select onValueChange={(v) => updateConfig("hairColor", v)} value={config.hairColor?.[0] || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select color" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getOptions("hairColor").map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

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
                        <div className="space-y-2">
                            <Label>Skin Color</Label>
                            <Select onValueChange={(v) => updateConfig("skinColor", v)} value={config.skinColor?.[0] || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select skin color" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getOptions("skinColor").map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    <TabsContent value="clothes" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Clothing</Label>
                            <Select onValueChange={(v) => updateConfig("clothes", v)} value={config.clothes?.[0] || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select clothes" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getOptions("clothes").map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    <TabsContent value="accessories" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Accessories</Label>
                            <Select onValueChange={(v) => updateConfig("accessories", v)} value={config.accessories?.[0] || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select accessories" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getOptions("accessories").map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
