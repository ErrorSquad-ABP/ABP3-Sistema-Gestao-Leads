import type { Request, Response } from 'express';

function getHealth(_request: Request, response: Response) {
	response.status(200).json({
		status: 'ok',
		service: 'back',
		timestamp: new Date().toISOString(),
	});
}

export { getHealth };
