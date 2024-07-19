import { useNavigate, } from '@remix-run/react';
import { useMutation } from '@tanstack/react-query';
import { honoClient } from '~/utils/hono-client';

export const useDeleteMutation = () => {
	const navigate = useNavigate();

	const deleteMutation = useMutation<
		{
			entityName: string;
		},
		{
			entityName: string;
			id: string | number;
		}
	>({
		mutationFn: (props: { entityName: string; id: string | number }) => {
			return honoClient.deleteRow.$post({
				json: props,
			});
		},
		onSuccess({ entityName }) {
			// queryClient.invalidateQueries(`view-all-${entityName}`);
			//
			navigate(`/${entityName}`);
		},
	});

	return deleteMutation;
};
