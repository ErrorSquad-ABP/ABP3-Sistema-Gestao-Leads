import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	createVehicle,
	deactivateVehicle,
	updateVehicle,
} from '../api/vehicles.service';
import type { CreateVehicleInput, UpdateVehicleInput } from '../model/vehicles.model';

function useCreateVehicleMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateVehicleInput) => createVehicle(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.listRoot });
		},
	});
}

function useUpdateVehicleMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { vehicleId: string; payload: UpdateVehicleInput }) =>
			updateVehicle(input.vehicleId, input.payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.listRoot });
		},
	});
}

function useDeactivateVehicleMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (vehicleId: string) => deactivateVehicle(vehicleId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.listRoot });
		},
	});
}

export { useCreateVehicleMutation, useDeactivateVehicleMutation, useUpdateVehicleMutation };

