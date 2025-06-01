 // define a type for the schema
export type Ingredient = {
    id: string;
    name: string;
    quantity: number;
    unit: "kg" | "g" | "L" | "ml";
    category: string; // e.g. meat, veg, carb
    location: string; // where the item is stored
}
