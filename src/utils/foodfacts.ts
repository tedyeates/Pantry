
import type { OpenFoodFactsResponse } from '@/lib/schemas/open-food-facts-schema';
import type { BarcodeIngredient, UnitExtended } from '@/lib/schemas/schema';
import convert from 'convert-units';

const OPEN_FOOD_FACTS_API_BASE_URL = import.meta.env.VITE_OPEN_FOOD_FACTS_API_BASE_URL;
const USER_AGENT = import.meta.env.VITE_USER_AGENT; // Replace with your app's info

export async function getOpenFoodFactsProduct(barcodeNumber: string): Promise<{
    success: boolean, 
    data?: Omit<BarcodeIngredient, 'id'>
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

        const [quantity, unit] = product.quantity?.split(' ') ?? [undefined, undefined];
        
        const unitsSupported: UnitExtended[] = convert().possibilities();
        unitsSupported.push('tbsp')
        unitsSupported.push('unit')
        
        let finalUnit = unit
        if (!unitsSupported.includes(unit as UnitExtended)) {
            finalUnit = 'unit'
        }

        return {
            success: true, 
            data: {
                name: product.product_name,
                quantity: Number(quantity),
                unit: finalUnit as UnitExtended,
                type: "Other",
                location: "Pantry",
                createdDate: new Date(),
                shop: product.stores,
                barcode: barcodeNumber
            }
        }
    } catch (error: unknown) {
        console.log(error)
        return {
            success: false,
            data: {
                name: "",
                quantity: 0,
                unit: "unit",
                type: "Other",
                location: "Pantry",
                createdDate: new Date(),
                shop: "",
                barcode: barcodeNumber
            }
        }
    }
}