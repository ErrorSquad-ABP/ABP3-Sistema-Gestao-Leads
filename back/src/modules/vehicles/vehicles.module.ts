import { Module } from '@nestjs/common';

import { CreateVehicleUseCase } from './application/use-cases/create-vehicle.use-case.js';
import { DeactivateVehicleUseCase } from './application/use-cases/deactivate-vehicle.use-case.js';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.use-case.js';
import { FindVehicleUseCase } from './application/use-cases/find-vehicle.use-case.js';
import { ListVehicleCatalogUseCase } from './application/use-cases/list-vehicle-catalog.use-case.js';
import { ListVehiclesUseCase } from './application/use-cases/list-vehicles.use-case.js';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.use-case.js';
import { VehicleFactory } from './domain/factories/vehicle.factory.js';
import { CarImagesVehicleImageProvider } from './infrastructure/images/car-images-vehicle-image.provider.js';
import { VehicleRepositoryFactory } from './infrastructure/persistence/factories/vehicle-repository.factory.js';
import { VehicleController } from './presentation/controllers/vehicle.controller.js';

@Module({
	controllers: [VehicleController],
	providers: [
		VehicleFactory,
		VehicleRepositoryFactory,
		CarImagesVehicleImageProvider,
		CreateVehicleUseCase,
		UpdateVehicleUseCase,
		FindVehicleUseCase,
		ListVehiclesUseCase,
		ListVehicleCatalogUseCase,
		DeactivateVehicleUseCase,
		DeleteVehicleUseCase,
	],
	exports: [VehicleRepositoryFactory],
})
class VehiclesModule {}

export { VehiclesModule };
