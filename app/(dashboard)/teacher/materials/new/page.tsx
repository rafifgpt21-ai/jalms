import { MaterialForm } from "@/components/teacher/materials/material-form"

export default function NewMaterialPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Add Study Material</h1>
                <p className="text-sm text-muted-foreground">
                    Upload a new study material. You can assign it to courses later.
                </p>
            </div>

            <MaterialForm />
        </div>
    )
}
