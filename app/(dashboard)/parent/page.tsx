import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export default function ParentDashboard() {
    return (
        <div className="space-y-4">
            <MobileHeaderSetter title="Parent Dashboard" subtitle="View your child's progress." />
            <p>View your Child's Progress.</p>
        </div>
    )
}
