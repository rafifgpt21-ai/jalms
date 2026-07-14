import { MaterialForm } from "@/components/teacher/materials/material-form"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export default function NewMaterialPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <MobileHeaderSetter title="Add Study Material" subtitle="Upload a resource and assign it to courses later." />

            <MaterialForm />
        </div>
    )
}
