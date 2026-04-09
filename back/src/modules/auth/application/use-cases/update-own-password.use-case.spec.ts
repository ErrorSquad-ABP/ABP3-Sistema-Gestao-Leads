import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { DomainValidationError } from '../../../../shared/domain/errors/domain-validation.error.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
import { User } from '../../../users/domain/entities/user.entity.js';
import { UserFactory } from '../../../users/domain/factories/user.factory.js';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error.js';
import { UpdateOwnPasswordUseCase } from './update-own-password.use-case.js';

const VALID_ARGON2_FIXTURE =
	'$argon2id$v=19$m=19456,t=2,p=1$H5K4T/9lCdJ1rPy/qic1Iw$FxSLF4hsA96bMKbhvKfu/V2rNzhVOH9YGJdkYyqbyXA';

const NEW_HASH =
	'$argon2id$v=19$m=19456,t=2,p=1$bbbbbbbbbbbbbbbb$cccccccccccccccccccccccccccccccccccccccccccccccccccccccc';

function uowThatRunsCallback(): IUnitOfWork {
	return {
		run: async <T>(fn: () => Promise<T>) => fn(),
		getTransactionContext: () => ({ client: {} }),
		begin: async () => {},
		commit: async () => {},
		rollback: async () => {},
	};
}

describe('UpdateOwnPasswordUseCase', () => {
	const self = new User(
		Uuid.parse('00000000-0000-4000-8000-000000000042'),
		Name.create('Test'),
		Email.create('t@example.com'),
		PasswordHash.create(VALID_ARGON2_FIXTURE),
		'ADMINISTRATOR',
		null,
	);

	it('lança DomainValidationError quando a nova senha é igual à atual', async () => {
		const uc = new UpdateOwnPasswordUseCase(
			new UserFactory(),
			{} as never,
			{} as never,
			{} as never,
		);
		Object.assign(uc as unknown as { unitOfWork: IUnitOfWork }, {
			unitOfWork: uowThatRunsCallback(),
		});
		await assert.rejects(
			() =>
				uc.execute(self.id.value, {
					currentPassword: 'samepassword',
					newPassword: 'samepassword',
				}),
			DomainValidationError,
		);
	});

	it('lança InvalidCredentialsError quando a senha atual está errada', async () => {
		const users = {
			findById: mock.fn(async () => self),
			update: mock.fn(async () => self),
		};
		const userRepositoryFactory = { create: () => users };
		const passwordHasher = {
			verify: mock.fn(async () => false),
			hash: mock.fn(async () => NEW_HASH),
		};
		const authSessions = {
			revokeAllActiveSessionsForUser: mock.fn(async () => {}),
		};
		const uc = new UpdateOwnPasswordUseCase(
			new UserFactory(),
			userRepositoryFactory as never,
			passwordHasher as never,
			authSessions as never,
		);
		Object.assign(uc as unknown as { unitOfWork: IUnitOfWork }, {
			unitOfWork: uowThatRunsCallback(),
		});
		await assert.rejects(
			() =>
				uc.execute(self.id.value, {
					currentPassword: 'wrong',
					newPassword: 'newpassword1',
				}),
			InvalidCredentialsError,
		);
		assert.equal(
			authSessions.revokeAllActiveSessionsForUser.mock.calls.length,
			0,
		);
	});

	it('atualiza a senha e revoga todas as sessões de refresh', async () => {
		const newPwUser = new User(
			self.id,
			self.name,
			self.email,
			PasswordHash.create(NEW_HASH),
			self.role,
			self.teamId,
		);
		const users = {
			findById: mock.fn(async () => self),
			update: mock.fn(async () => newPwUser),
		};
		const userRepositoryFactory = { create: () => users };
		const passwordHasher = {
			verify: mock.fn(async () => true),
			hash: mock.fn(async () => NEW_HASH),
		};
		const authSessions = {
			revokeAllActiveSessionsForUser: mock.fn(async () => {}),
		};
		const uc = new UpdateOwnPasswordUseCase(
			new UserFactory(),
			userRepositoryFactory as never,
			passwordHasher as never,
			authSessions as never,
		);
		Object.assign(uc as unknown as { unitOfWork: IUnitOfWork }, {
			unitOfWork: uowThatRunsCallback(),
		});
		const out = await uc.execute(self.id.value, {
			currentPassword: 'oldpassword',
			newPassword: 'newpassword1',
		});
		assert.ok(out.passwordHash.value.includes('argon2'));
		assert.equal(users.update.mock.calls.length, 1);
		assert.equal(passwordHasher.hash.mock.calls.length, 1);
		assert.equal(
			authSessions.revokeAllActiveSessionsForUser.mock.calls.length,
			1,
		);
		const revokeCall =
			authSessions.revokeAllActiveSessionsForUser.mock.calls[0];
		assert.ok(revokeCall !== undefined);
		const revokeArgs = revokeCall.arguments as unknown as readonly [
			string,
			unknown,
		];
		assert.equal(revokeArgs[0], self.id.value);
		assert.ok(revokeArgs[1] !== undefined);
	});
});
