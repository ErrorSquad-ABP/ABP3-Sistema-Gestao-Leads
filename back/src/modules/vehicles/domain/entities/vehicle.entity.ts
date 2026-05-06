import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { SupportedFuelType } from '../../../../shared/domain/enums/supported-fuel-type.enum.js';
import type { VehicleStatus } from '../../../../shared/domain/enums/vehicle-status.enum.js';
import type { StoreId } from '../../../../shared/domain/types/identifiers.js';
// biome-ignore lint/style/useImportType: Uuid é classe em runtime (parse/generate)
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import type { Money } from '../../../../shared/domain/value-objects/money.value-object.js';
import { VehicleInactiveError } from '../errors/vehicle-inactive.error.js';

type VehicleImageMetadata = {
	readonly imageUrl: string | null;
	readonly imageAlt: string | null;
	readonly imageProvider: string | null;
	readonly imageProviderPhotoId: string | null;
	readonly imagePhotographerName: string | null;
	readonly imagePhotographerUrl: string | null;
	readonly imageSourceUrl: string | null;
	readonly imageResolvedAt: Date | null;
	readonly imageExpiresAt: Date | null;
};

class Vehicle extends AggregateRoot {
	private _id: Uuid;
	private _storeId: StoreId;
	private _brand: string;
	private _model: string;
	private _version: string | null;
	private _modelYear: number;
	private _manufactureYear: number | null;
	private _color: string | null;
	private _mileage: number;
	private _supportedFuelType: SupportedFuelType;
	private _price: Money;
	private _status: VehicleStatus;
	private _plate: string | null;
	private _vin: string | null;
	private _imageUrl: string | null;
	private _imageAlt: string | null;
	private _imageProvider: string | null;
	private _imageProviderPhotoId: string | null;
	private _imagePhotographerName: string | null;
	private _imagePhotographerUrl: string | null;
	private _imageSourceUrl: string | null;
	private _imageResolvedAt: Date | null;
	private _imageExpiresAt: Date | null;
	private _createdAt: Date;
	private _updatedAt: Date;

	constructor(
		id: Uuid,
		storeId: StoreId,
		brand: string,
		model: string,
		version: string | null,
		modelYear: number,
		manufactureYear: number | null,
		color: string | null,
		mileage: number,
		supportedFuelType: SupportedFuelType,
		price: Money,
		status: VehicleStatus,
		plate: string | null,
		vin: string | null,
		imageMetadata: VehicleImageMetadata,
		createdAt: Date,
		updatedAt: Date,
	) {
		super();
		this._id = id;
		this._storeId = storeId;
		this._brand = brand;
		this._model = model;
		this._version = version;
		this._modelYear = modelYear;
		this._manufactureYear = manufactureYear;
		this._color = color;
		this._mileage = mileage;
		this._supportedFuelType = supportedFuelType;
		this._price = price;
		this._status = status;
		this._plate = plate;
		this._vin = vin;
		this._imageUrl = imageMetadata.imageUrl;
		this._imageAlt = imageMetadata.imageAlt;
		this._imageProvider = imageMetadata.imageProvider;
		this._imageProviderPhotoId = imageMetadata.imageProviderPhotoId;
		this._imagePhotographerName = imageMetadata.imagePhotographerName;
		this._imagePhotographerUrl = imageMetadata.imagePhotographerUrl;
		this._imageSourceUrl = imageMetadata.imageSourceUrl;
		this._imageResolvedAt = imageMetadata.imageResolvedAt;
		this._imageExpiresAt = imageMetadata.imageExpiresAt;
		this._createdAt = createdAt;
		this._updatedAt = updatedAt;
	}

	get id(): Uuid {
		return this._id;
	}

	get storeId(): StoreId {
		return this._storeId;
	}

	get brand(): string {
		return this._brand;
	}

	get model(): string {
		return this._model;
	}

	get version(): string | null {
		return this._version;
	}

	get modelYear(): number {
		return this._modelYear;
	}

	get manufactureYear(): number | null {
		return this._manufactureYear;
	}

	get color(): string | null {
		return this._color;
	}

	get mileage(): number {
		return this._mileage;
	}

	get supportedFuelType(): SupportedFuelType {
		return this._supportedFuelType;
	}

	get price(): Money {
		return this._price;
	}

	get status(): VehicleStatus {
		return this._status;
	}

	get plate(): string | null {
		return this._plate;
	}

	get vin(): string | null {
		return this._vin;
	}

	get imageUrl(): string | null {
		return this._imageUrl;
	}

	get imageAlt(): string | null {
		return this._imageAlt;
	}

	get imageProvider(): string | null {
		return this._imageProvider;
	}

	get imageProviderPhotoId(): string | null {
		return this._imageProviderPhotoId;
	}

	get imagePhotographerName(): string | null {
		return this._imagePhotographerName;
	}

	get imagePhotographerUrl(): string | null {
		return this._imagePhotographerUrl;
	}

	get imageSourceUrl(): string | null {
		return this._imageSourceUrl;
	}

	get imageResolvedAt(): Date | null {
		return this._imageResolvedAt;
	}

	get imageExpiresAt(): Date | null {
		return this._imageExpiresAt;
	}

	get imageMetadata(): VehicleImageMetadata {
		return {
			imageUrl: this._imageUrl,
			imageAlt: this._imageAlt,
			imageProvider: this._imageProvider,
			imageProviderPhotoId: this._imageProviderPhotoId,
			imagePhotographerName: this._imagePhotographerName,
			imagePhotographerUrl: this._imagePhotographerUrl,
			imageSourceUrl: this._imageSourceUrl,
			imageResolvedAt: this._imageResolvedAt,
			imageExpiresAt: this._imageExpiresAt,
		};
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	isInactive(): boolean {
		return this._status === 'INACTIVE';
	}

	private assertActiveForChanges(): void {
		if (this.isInactive()) {
			throw new VehicleInactiveError(this._id.value);
		}
	}

	changeBrand(brand: string): void {
		this.assertActiveForChanges();
		if (this._brand === brand) {
			return;
		}
		this._brand = brand;
	}

	changeModel(model: string): void {
		this.assertActiveForChanges();
		if (this._model === model) {
			return;
		}
		this._model = model;
	}

	changeVersion(version: string | null): void {
		this.assertActiveForChanges();
		const unchanged =
			(this._version === null && version === null) || this._version === version;
		if (unchanged) {
			return;
		}
		this._version = version;
	}

	changeModelYear(year: number): void {
		this.assertActiveForChanges();
		if (this._modelYear === year) {
			return;
		}
		this._modelYear = year;
	}

	changeManufactureYear(year: number | null): void {
		this.assertActiveForChanges();
		const unchanged =
			(this._manufactureYear === null && year === null) ||
			this._manufactureYear === year;
		if (unchanged) {
			return;
		}
		this._manufactureYear = year;
	}

	changeColor(color: string | null): void {
		this.assertActiveForChanges();
		const unchanged =
			(this._color === null && color === null) || this._color === color;
		if (unchanged) {
			return;
		}
		this._color = color;
	}

	changeMileage(mileage: number): void {
		this.assertActiveForChanges();
		if (this._mileage === mileage) {
			return;
		}
		this._mileage = mileage;
	}

	changeSupportedFuelType(fuelType: SupportedFuelType): void {
		this.assertActiveForChanges();
		if (this._supportedFuelType === fuelType) {
			return;
		}
		this._supportedFuelType = fuelType;
	}

	changePrice(price: Money): void {
		this.assertActiveForChanges();
		if (this._price.equals(price)) {
			return;
		}
		this._price = price;
	}

	changeStatus(status: VehicleStatus): void {
		if (this._status === status) {
			return;
		}
		if (this._status === 'INACTIVE') {
			throw new VehicleInactiveError(this._id.value);
		}
		this._status = status;
	}

	changePlate(plate: string | null): void {
		this.assertActiveForChanges();
		const unchanged =
			(this._plate === null && plate === null) || this._plate === plate;
		if (unchanged) {
			return;
		}
		this._plate = plate;
	}

	changeVin(vin: string | null): void {
		this.assertActiveForChanges();
		const unchanged = (this._vin === null && vin === null) || this._vin === vin;
		if (unchanged) {
			return;
		}
		this._vin = vin;
	}

	changeImageMetadata(metadata: VehicleImageMetadata | null): void {
		this._imageUrl = metadata?.imageUrl ?? null;
		this._imageAlt = metadata?.imageAlt ?? null;
		this._imageProvider = metadata?.imageProvider ?? null;
		this._imageProviderPhotoId = metadata?.imageProviderPhotoId ?? null;
		this._imagePhotographerName = metadata?.imagePhotographerName ?? null;
		this._imagePhotographerUrl = metadata?.imagePhotographerUrl ?? null;
		this._imageSourceUrl = metadata?.imageSourceUrl ?? null;
		this._imageResolvedAt = metadata?.imageResolvedAt ?? null;
		this._imageExpiresAt = metadata?.imageExpiresAt ?? null;
	}

	deactivate(): void {
		if (this._status === 'INACTIVE') {
			return;
		}
		this._status = 'INACTIVE';
	}
}

export { Vehicle };
export type { VehicleImageMetadata };
