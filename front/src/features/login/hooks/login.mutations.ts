import { useMutation } from '@tanstack/react-query';

import { login } from '../api/login.service';

function useLoginMutation() {
	return useMutation({
		mutationFn: login,
	});
}

export { useLoginMutation };
