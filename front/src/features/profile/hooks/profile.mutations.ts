import { useMutation } from '@tanstack/react-query';

import { updateOwnEmail, updateOwnPassword } from '../api/profile.service';

function useUpdateOwnEmailMutation() {
	return useMutation({
		mutationFn: updateOwnEmail,
	});
}

function useUpdateOwnPasswordMutation() {
	return useMutation({
		mutationFn: updateOwnPassword,
	});
}

export { useUpdateOwnEmailMutation, useUpdateOwnPasswordMutation };
