'use client';

import Image from 'next/image';
import { Car } from 'lucide-react';

import type { Vehicle } from '../model/vehicles.model';

type VehicleImageProps = {
	vehicle: Vehicle;
	className?: string;
	priority?: boolean;
};

function VehicleImage({
	vehicle,
	className = '',
	priority = false,
}: VehicleImageProps) {
	const label =
		vehicle.imageAlt ??
		`${vehicle.brand} ${vehicle.model} ${vehicle.modelYear}`;

	return (
		<div
			className={`relative overflow-hidden rounded-md bg-[#f7f9fb] ${className}`}
		>
			{vehicle.imageUrl ? (
				<Image
					src={vehicle.imageUrl}
					alt={label}
					fill
					className="object-contain mix-blend-multiply"
					priority={priority}
					sizes="(min-width: 1280px) 280px, (min-width: 768px) 33vw, 90vw"
				/>
			) : (
				<div className="flex h-full w-full items-center justify-center text-[#8a96a8]">
					<Car className="size-10" aria-hidden="true" />
					<span className="sr-only">{label}</span>
				</div>
			)}
		</div>
	);
}

export { VehicleImage };
