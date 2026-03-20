import { NextResponse } from 'next/server';

import { getApiOverview } from '../../../modules/system/application/get-api-overview';

export const dynamic = 'force-dynamic';

function GET() {
	return NextResponse.json(getApiOverview());
}

export { GET };
