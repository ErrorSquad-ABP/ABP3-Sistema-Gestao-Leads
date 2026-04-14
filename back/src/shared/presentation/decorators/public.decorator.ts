import { SetMetadata } from '@nestjs/common';

const IS_PUBLIC_KEY = 'auth.isPublic';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export { IS_PUBLIC_KEY, Public };
