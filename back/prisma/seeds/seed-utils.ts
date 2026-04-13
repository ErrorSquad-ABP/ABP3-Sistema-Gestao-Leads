import { createHash } from 'node:crypto';

import * as argon2 from 'argon2';

export function deterministicUuid(seed: string) {
	const hash = createHash('sha256').update(seed).digest('hex');
	const timeLow = hash.slice(0, 8);
	const timeMid = hash.slice(8, 12);
	const timeHigh = `4${hash.slice(13, 16)}`;
	const variant = ['8', '9', 'a', 'b'][
		Number.parseInt(hash[16] ?? '0', 16) % 4
	];
	const clockSeq = `${variant}${hash.slice(17, 20)}`;
	const node = hash.slice(20, 32);

	return `${timeLow}-${timeMid}-${timeHigh}-${clockSeq}-${node}`;
}

export async function hashPassword(plainPassword: string) {
	return argon2.hash(plainPassword, {
		type: argon2.argon2id,
		memoryCost: 19456,
		timeCost: 2,
		parallelism: 1,
	});
}
