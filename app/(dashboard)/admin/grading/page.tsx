import { GradingScaleForm } from "@/components/admin/grading/grading-scale-form"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export default function GradingPage() {
    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Grading Settings" />

            <div>
                <h1 className="text-2xl font-bold tracking-tight">Grading Settings</h1>
                <p className="text-muted-foreground">
                    Configure global grading standards and defaults.
                </p>
            </div>

            <div className="max-w-3xl">
                <GradingScaleForm />
            </div>
        </div>
    )
}
