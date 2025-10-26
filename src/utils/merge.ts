import type { PantryIngredient } from "@/lib/schemas/schema";

export function merge(originaItem: PantryIngredient, newItem: PantryIngredient) {
    if (!originaItem || !newItem) return false;
    if (originaItem.name !== newItem.name) return false;
    if (originaItem.type !== newItem.type) return false;
    // TODO: allow different unit merging
    if (originaItem.unit !== newItem.unit) return false;

    const mergedItem = { 
        ...originaItem, 
        quantity: originaItem.quantity + newItem.quantity,
        location: newItem.location
    };

    return mergedItem;
}