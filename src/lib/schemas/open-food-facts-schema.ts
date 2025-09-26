export interface Product {
    product_name: string;
    product: string;
    food_groups: string;
    stores: string;
    quantity: string;
}

export interface OpenFoodFactsResponse {
    code: string; // The barcode number
    status: number; // 0 for not found, 1 for found
    status_verbose: string; // e.g., "product found"
    product?: Product;
}

