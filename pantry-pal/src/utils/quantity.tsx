
import convert, { type Unit } from 'convert-units';
import type { UnitExtended } from './schema';


function calculateQuantity(currentQuantity: number, reduceQuantity: number) {
    let newQuantity = currentQuantity - reduceQuantity

    if (newQuantity < 0) {
        newQuantity = 0
    }

    return newQuantity
}

export function convertQuantity(
    currentQuantity: number, 
    currentUnit: UnitExtended, 
    reduceQuantity: number, 
    reduceUnit: UnitExtended
) {
    const disallowedStorageUnits = new Set<Partial<UnitExtended>>([
        "cup", "tsp", "Tbs", "tbsp", "pinch"
    ])

    const massUnits = new Set(convert().possibilities("mass"))
    const volumeUnits = new Set(convert().possibilities("volume"))

    // Can only store ingredients in mass e.g. g or volume e.g. ml
    if (disallowedStorageUnits.has(currentUnit)) {
        throw new Error("You can't store ingredients as that unit!")
    }
    
    if (currentUnit == "unit" && reduceUnit !== "unit") {
        throw new Error("You can't convert unit into other measurements")
    }

    if (currentUnit == "unit"){
        return {
            quantity: reduceQuantity,
            unit: reduceUnit
        }
    }

    // Convert library use tbs instead of tbsp
    if (reduceUnit == "tbsp") {
        reduceUnit = "Tbs"
    }

    // Add support for estimated conversion between mass and volume
    // Americans love measuring flour in cups
    let newUnit: string = currentUnit
    const currentIsMass = massUnits.has(currentUnit as Unit)
    const reduceIsVolume = volumeUnits.has(reduceUnit as Unit)
    if (currentIsMass && reduceIsVolume) {
        newUnit = {
            "g": "ml",
            "kg": "l",
        }[currentUnit as "kg" | "g"]
    }

    if (newUnit !== reduceUnit) {
        reduceQuantity = convert(reduceQuantity)
            .from(reduceUnit as Unit)
            .to(newUnit as Unit)
    }


    let newQuantity = calculateQuantity(currentQuantity, reduceQuantity)

    // Convert back if previously converted from mass to volume
    if (currentUnit !== newUnit) {
        newUnit = {
            "ml": "g",
            "l": "g",
        }[newUnit as "ml" | "l"]
    }

    // Convert from l/kg to ml/g if decimal
    if (newQuantity < 1 && newQuantity > 0) {
        const { val, unit } = convert(newQuantity).from(newUnit as Unit).toBest()
        newQuantity = val
        newUnit = unit
    }


    return [newQuantity, newUnit as Unit]
}
