import type { Unit } from "convert-units";
export type UnitExtended = Unit | 'unit' | 'tbsp';

export type FirebaseObject = {
    id: string;
    createdDate: Date;
}

export type Location = {
    postcode: string;
    address: string;
    latitude: number;
    longitude: number;
}

export type Shop = {
    name: string;
    location: Location;
    aisles: Aisle[];
}

export type Home = {
    name: string;
    location: Location;
    storageAreas: StorageArea[];
}

export type Aisle = {
    aisle: number;
    name: string;
}

export type StorageArea = {
    name: string;
}

export type Ingredient = {
    name: string;
    quantity: number;
    unit: string;
    storageArea?: StorageArea;
    aisle?: Aisle;
}