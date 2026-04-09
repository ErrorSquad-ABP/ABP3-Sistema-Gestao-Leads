import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
import { User } from '../../../users/domain/entities/user.entity.js';
import { UserEmailAlreadyExistsError } from '../../../users/domain/errors/user-email-already-exists.error.js';
import { UserFactory } from '../../../users/domain/factories/user.factory.js';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error.js';
import { UpdateOwnEmailUseCase } from './update-own-email.use-case.js';

const VALID_ARGON2_FIXTURE =
	'$argon2id$v=19$m=19456,t=2,p=1$H5K4T/9lCdJ1rPy/qic1Iw$FxSLF4hsA96bMKbhvKfu/V2rNzhVOH9YGJdkYyqbyXA';

function uowThatRunsCallback(): IUnitOfWork {
	return {
		run: async <T>(fn: () => Promise<T>) => fn(),
		getTransactionContext: () => ({ client: {} }),
		begin: async () => {},
		commit: async () => {},
		rollback: async () => {},
	};
}

describe('UpdateOwnEmailUseCase', () => {
	const self = new User(
		Uuid.parse('00000000-0000-4000-8000-000000000042'),
		Name.create('Test'),
		Email.create('old@example.com'),
		PasswordHash.create(VALID_ARGON2_FIXTURE),
		'ADMINISTRATOR',
		null,
	);

	it('lança InvalidCredentialsError quando a senha atual está errada', async () => {
		const users = {
			findById: mock.fn(async () => self),
			findByEmail: mock.fn(async () => null),
			update: mock.fn(async () => self),
		};
		const userRepositoryFactory = {
			create: () => users,
		};
		const passwordHasher = {
			verify: mock.fn(async () => false),
			hash: mock.fn(async () => ''),
		};
		const authSessions = {
			revokeAllActiveSessionsForUser: mock.fn(async () => {}),
		};
		const uc = new UpdateOwnEmailUseCase(
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
					email: 'new@example.com',
				}),
			InvalidCredentialsError,
		);
		assert.equal(
			authSessions.revokeAllActiveSessionsForUser.mock.calls.length,
			0,
		);
	});

	it('lança UserEmailAlreadyExistsError quando o e-mail pertence a outro utilizador', async () => {
		const other = new User(
			Uuid.parse('00000000-0000-4000-8000-000000000099'),
			Name.create('Other'),
			Email.create('taken@example.com'),
			PasswordHash.create(VALID_ARGON2_FIXTURE),
			'ATTENDANT',
			null,
		);
		const users = {
			findById: mock.fn(async () => self),
			findByEmail: mock.fn(async () => other),
			update: mock.fn(async () => self),
		};
		const userRepositoryFactory = { create: () => users };
		const passwordHasher = {
			verify: mock.fn(async () => true),
			hash: mock.fn(),
		};
		const authSessions = {
			revokeAllActiveSessionsForUser: mock.fn(async () => {}),
		};
		const uc = new UpdateOwnEmailUseCase(
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
					currentPassword: 'okpassword',
					email: 'taken@example.com',
				}),
			UserEmailAlreadyExistsError,
		);
		assert.equal(
			authSessions.revokeAllActiveSessionsForUser.mock.calls.length,
			0,
		);
	});

	it('persiste e revoga sessões quando o e-mail muda', async () => {
		const updated = new User(
			self.id,
			self.name,
			Email.create('new@example.com'),
			self.passwordHash,
			self.role,
			self.teamId,
		);
		const users = {
			findById: mock.fn(async () => self),
			findByEmail: mock.fn(async () => null),
			update: mock.fn(async () => updated),
		};
		const userRepositoryFactory = { create: () => users };
		const passwordHasher = {
			verify: mock.fn(async () => true),
			hash: mock.fn(),
		};
		const authSessions = {
			revokeAllActiveSessionsForUser: mock.fn(async () => {}),
		};
		const uc = new UpdateOwnEmailUseCase(
			new UserFactory(),
			userRepositoryFactory as never,
			passwordHasher as never,
			authSessions as never,
		);
		Object.assign(uc as unknown as { unitOfWork: IUnitOfWork }, {
			unitOfWork: uowThatRunsCallback(),
		});
		const out = await uc.execute(self.id.value, {
			currentPassword: 'okpassword',
			email: 'new@example.com',
		});
		assert.equal(out.user.email.value, 'new@example.com');
		assert.equal(out.refreshSessionsRevoked, true);
		assert.equal(users.update.mock.calls.length, 1);
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

	it('não revoga sessões quando o e-mail é o mesmo', async () => {
		const users = {
			findById: mock.fn(async () => self),
			findByEmail: mock.fn(async () => null),
			update: mock.fn(async () => self),
		};
		const userRepositoryFactory = { create: () => users };
		const passwordHasher = {
			verify: mock.fn(async () => true),
			hash: mock.fn(),
		};
		const authSessions = {
			revokeAllActiveSessionsForUser: mock.fn(async () => {}),
		};
		const uc = new UpdateOwnEmailUseCase(
			new UserFactory(),
			userRepositoryFactory as never,
			passwordHasher as never,
			authSessions as never,
		);
		Object.assign(uc as unknown as { unitOfWork: IUnitOfWork }, {
			unitOfWork: uowThatRunsCallback(),
		});
		const out = await uc.execute(self.id.value, {
			currentPassword: 'okpassword',
			email: 'old@example.com',
		});
		assert.equal(out.user.email.value, 'old@example.com');
		assert.equal(out.refreshSessionsRevoked, false);
		assert.equal(users.update.mock.calls.length, 0);
		assert.equal(
			authSessions.revokeAllActiveSessionsForUser.mock.calls.length,
			0,
		);
	});
});
