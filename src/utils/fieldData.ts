import type { FormFieldExtended } from "@/lib/schemas/schema";
import { getUnits } from "./options";

const defaultPantryFormFields: FormFieldExtended[] = [
    {
        name: 'name', label: 'Ingredient Name', type: 'text', required: true, 
        placeholder: 'e.g., Flour'
    },
    {
        name: 'type', label: 'Type', type: 'select', 
        required: true, relatedCollection: 'ingredientType'
    },
    {
        name: 'location', label: 'Location', type: 'select-firebase', 
        required: true, relatedCollection: 'location'
    },
    {
        name: 'shop', label: 'Shop', type: 'select', 
        required: true, relatedCollection: 'shop'
    },
];

const createQuantityField: FormFieldExtended = { 
    name: 'quantity', label: 'Quantity', type: 'quantity', 
    min: 0, step: 0.01, required: true, 
    placeholder: 'e.g., 500', extraFields: [{
        name: 'unit', label: 'Unit', type: 'select', 
        options: getUnits(true)
    }]
}


export const createFields: FormFieldExtended[] = [
    ...defaultPantryFormFields,
    createQuantityField
]

export const updateFields: FormFieldExtended[] = [
    ...defaultPantryFormFields,
    createQuantityField
]  