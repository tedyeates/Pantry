
import type { OpenFoodFactsResponse } from '@/lib/schemas/open-food-facts-schema';
import type { PantryIngredient, UnitExtended } from '@/lib/schemas/schema';

const OPEN_FOOD_FACTS_API_BASE_URL = import.meta.env.VITE_OPEN_FOOD_FACTS_API_BASE_URL;
const USER_AGENT = import.meta.env.VITE_USER_AGENT; // Replace with your app's info

export async function getOpenFoodFactsProduct(barcodeNumber: string): Promise<{
    success: boolean, 
    data?: Omit<PantryIngredient, 'id'> 
}> {
    const url = `${OPEN_FOOD_FACTS_API_BASE_URL}${barcodeNumber}`;
    const headers = { 'User-Agent': USER_AGENT };

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url, { headers, signal: controller.signal }); // 10 second timeout
        clearTimeout(timeoutId);

        if (!response.ok) {
            // fetch() only throws an error for network issues, not for HTTP error codes (like 404, 500)
            // So, we manually check response.ok and throw an error if it's not successful (2xx status)
            return { 
                success: false
            }
        }

        const data: OpenFoodFactsResponse = await response.json();

        if (data.status !== 1 || !data.product) 
            return { 
                success: false
            }
        
        const product = data.product;


        return {
            success: true, 
            data: {
                name: product.product_name,
                quantity: Number(product.product_quantity),
                unit: product.product_quantity_unit as UnitExtended,
                type: "Other",
                location: "Pantry",
                createdDate: new Date()
            }
        }
    } catch (error: unknown) {
        console.log(error)
        return {
            success: false
        }
    }
}