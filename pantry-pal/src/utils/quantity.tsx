
import convert, { type Unit } from 'convert-units';
import type { QuantityReturnType, UnitExtended } from '../lib/schemas/schema';


function calculateQuantity(currentQuantity: number, reduceQuantity: number): number {
    let newQuantity = currentQuantity - reduceQuantity

    if (newQuantity < 0) {
        newQuantity = 0
    }

    return newQuantity
}

function convertUnitMassToVolume(convertFromUnit: UnitExtended) {
    const convertedUnits = {
        "g": "ml",
        "kg": "l",
    } as Record<UnitExtended, UnitExtended>

    if (convertFromUnit in convertedUnits) {
        return convertedUnits[convertFromUnit]
    }

    throw new Error(`Not implemented unit conversion ${convertFromUnit}`)
}

function convertToDifferentUnit(convertFromUnit: UnitExtended, convertToUnit: UnitExtended, quantity: number) {
    if (convertFromUnit === convertToUnit) {
        return { val: quantity, unit: convertToUnit }
    }

    const massUnits = new Set(convert().possibilities("mass"))
    const volumeUnits = new Set(convert().possibilities("volume"))

    const convertFromIsMass = massUnits.has(convertFromUnit as Unit)
    const convertToIsMass = massUnits.has(convertToUnit as Unit)
    const convertFromIsVolume = volumeUnits.has(convertFromUnit as Unit)
    const convertToIsVolume = volumeUnits.has(convertToUnit as Unit)

    let newConvertFromUnit = convertFromUnit
    if (convertFromIsMass && convertToIsVolume) {
        newConvertFromUnit = convertUnitMassToVolume(convertFromUnit)
    }

    let newConvertToUnit = convertToUnit
    if (convertFromIsVolume && convertToIsMass) {
        newConvertToUnit = convertUnitMassToVolume(convertToUnit)
    }
    

    return {
        val: convert(quantity)
            .from(newConvertFromUnit as Unit)
            .to(newConvertToUnit as Unit),
        unit: convertToUnit
    }
}

function round(quantity: number) {
    return Math.round(quantity * 100) / 100
}

function simplifyQuantity(quantity: number, oldUnit: UnitExtended): QuantityReturnType {
    if (quantity < 1 && quantity > 0) {
        const { val, unit } = convert(quantity).from(oldUnit as Unit).toBest() as QuantityReturnType
        return {val: round(val), unit}
    }

    return {val: round(quantity), unit: oldUnit}
}


export function reduceQuantity(
    currentQuantity: number, 
    currentUnit: UnitExtended, 
    subtractedQuantity: number, 
    subtractedUnit: UnitExtended
): QuantityReturnType {
    const disallowedStorageUnits = new Set<Partial<UnitExtended>>([
        "cup", "tsp", "Tbs", "tbsp"
    ])

    // Can only store ingredients in mass e.g. g or volume e.g. ml
    if (disallowedStorageUnits.has(currentUnit)) {
        throw new Error("You can't store ingredients as that unit!")
    }

    if (subtractedUnit === currentUnit) {
        return {
            val: calculateQuantity(currentQuantity, subtractedQuantity),
            unit: currentUnit
        }
    }

    if (subtractedUnit === "unit") {
        throw new Error("You can't subtract units from a non unit measurement")
    }

    if (currentUnit === "unit") {
        throw new Error("You can't subtract non unit measurements from a unit measurement")
    }

    const { val } = convertToDifferentUnit(subtractedUnit, currentUnit, subtractedQuantity)
    const newQuantity = calculateQuantity(currentQuantity, val)
    return simplifyQuantity(newQuantity, currentUnit)
}

// Fix reduce quantity
export function convertUnit(
    quantity: number, 
    oldUnit: UnitExtended, 
    newUnit: UnitExtended
) {
    const unconvertableUnits = new Set(['unit', 'pinch'])
    if (unconvertableUnits.has(oldUnit) || unconvertableUnits.has(newUnit)) {
        return {
            val: "",
            unit: newUnit
        }
    }

    return convertToDifferentUnit(oldUnit, newUnit, quantity)
}
