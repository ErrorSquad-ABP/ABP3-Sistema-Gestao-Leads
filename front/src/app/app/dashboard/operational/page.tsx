import { OperationalDashboardPageContent } from "@/features/dashboard-operational/components/operational-dashboard-page-content"
import { requireUserWithRouteAccess } from "@/lib/auth/session"

async function OperationalDashboardPage() {
	await requireUserWithRouteAccess("dashboardOperational")

	return <OperationalDashboardPageContent />
}

export default OperationalDashboardPage
