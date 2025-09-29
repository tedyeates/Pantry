import type { FormFieldExtended } from "@/lib/schemas/schema";
import { getIngredientTypes, getLocations, getShops, getUnits } from "./options";

const defaultPantryFormFields: FormFieldExtended[] = [
    { name: 'name', label: 'Ingredient Name', type: 'text', required: true, placeholder: 'e.g., Flour' },
    {
        name: 'type', label: 'Type', type: 'select', required: true, options: getIngredientTypes()
    },
    {
        name: 'location', label: 'Location', type: 'select', required: true, options: getLocations()
    },
    {
        name: 'shop', label: 'Shop', type: 'select', required: true, options: getShops()
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

const updateQuantityField: FormFieldExtended = {
    ...createQuantityField,
    type: 'reduceQuantity',
    extraFields: [{
        name: 'unit', label: 'Unit', type: 'select', 
        options: getUnits(true)
    },
    {
        name: 'reduce_quantity', label: 'Quantity', type: 'quantity', 
        min: 0, step: 0.01, required: false, 
        placeholder: 'e.g., 500', extraFields:[{
            name: 'reduce_unit', label: 'Unit', type: 'select',
            options: getUnits()
        }]
    }]
}

export const createFields: FormFieldExtended[] = [
    ...defaultPantryFormFields,
    createQuantityField
]

export const updateFields: FormFieldExtended[] = [
    ...defaultPantryFormFields,
    updateQuantityField
]  