import type { Unit } from "convert-units";

 // define a type for the schema
export type UnitExtended = Unit | 'unit' | 'pinch' | 'tbsp';

export type Ingredient = {
    id: string;
    name: string;
    quantity: number;
    unit: Unit
    type: string; // e.g. meat, veg, carb
    location: string; // where the item is stored
}

export type SupportedFields = string | number | boolean | Date | number;

export type FormField = {
    name: string;
    label: string;
    type: 'text' | 'number' |'select' | 'quantity' | 'reduceQuantity';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    min?: number;
    step?: number;
}

export type FormFieldExtended = FormField & { extraFields?: FormField[] };

export type ObjectType  = 'pantry' | 'recipe';