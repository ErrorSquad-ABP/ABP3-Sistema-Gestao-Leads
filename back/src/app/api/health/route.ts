import { NextResponse } from 'next/server';

import { getHealth } from '../../../modules/health/application/get-health';

export const dynamic = 'force-dynamic';

function GET() {
	return NextResponse.json(getHealth());
}

export { GET };
