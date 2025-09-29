import type { Unit } from "convert-units";
import { Timestamp } from "firebase/firestore";

export type Recipe = {
    id: string;
    name: string;
    ingredients: Ingredient[];
    instructions: string;
}

 // define a type for the schema
export type UnitExtended = Unit | 'unit' | 'tbsp';

export type Ingredient = {
    id: string;
    name: string;
    quantity: number;
    unit: UnitExtended;
    type: string; // e.g. meat, veg, carb
    location: string; // where the item is stored
    shop: string;
}

export type FirebaseIngredient = Ingredient & { 
    createdDate: Timestamp;
};

export type PantryIngredient = Omit<Ingredient, 'id'> & { 
    createdDate: Date;
};

export type BarcodeIngredient = PantryIngredient & { 
    barcode: string;
};


export type PantryIngredientValues = Date | string | number | UnitExtended;



export type PantryItem = Omit<Ingredient, 'id'> & { 
    reduce_quantity?: number, reduce_unit?: UnitExtended;
};

export type SupportedObjects = Recipe | Ingredient;


export type SupportedFields = string | number | boolean | Date | number | Ingredient[];

export type FormField = {
    name: string;
    label: string;
    type: 'text' | 'number' |'select' | 'quantity' | 'reduceQuantity' | 'textarea' | 'arrayOfObjects';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    relatedCollection?: string;
    min?: number;
    step?: number;
}

export type FormFieldExtended = FormField & { extraFields?: FormFieldExtended[] };


export type DialogData<T> = {
    title: string;
    description?: string;
    initialData?: Partial<T>;
    dialogType: 'create' | 'update';
    fields: FormFieldExtended[];
}

export type ObjectType  = 'pantry' | 'recipe';

export type QuantityReturnType = {
    val: number;
    unit: UnitExtended;
}