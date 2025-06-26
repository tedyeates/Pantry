export interface Product {
    product_name: string;
    product_quantity: string; // e.g., "400"
    product_quantity_unit: string; // e.g., "g"
    food_groups: string
}

export interface OpenFoodFactsResponse {
    code: string; // The barcode number
    status: number; // 0 for not found, 1 for found
    status_verbose: string; // e.g., "product found"
    product?: Product;
}

