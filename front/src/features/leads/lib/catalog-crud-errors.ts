import { humanizeFormApiError } from '@/lib/http/humanize-api-error';

function getCatalogCrudErrorMessage(error: unknown) {
	return humanizeFormApiError(error);
}

export { getCatalogCrudErrorMessage };
