import { ProfilePageContent } from '@/features/profile/components/ProfilePageContent';
import { requireAuthenticatedUser } from '@/lib/auth/session';

async function ProfilePage() {
	const currentUser = await requireAuthenticatedUser();

	return <ProfilePageContent currentUser={currentUser} />;
}

export default ProfilePage;
