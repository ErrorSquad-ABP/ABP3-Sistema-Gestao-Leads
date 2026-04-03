import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * Produces Argon2id hashes compatible with {@link PasswordHash} domain rules (m>=19456, t>=2, p>=1).
 */
@Injectable()
class Argon2PasswordHasherService {
	async hash(plainPassword: string): Promise<string> {
		return argon2.hash(plainPassword, {
			type: argon2.argon2id,
			memoryCost: 19456,
			timeCost: 2,
			parallelism: 1,
		});
	}
}

export { Argon2PasswordHasherService };
