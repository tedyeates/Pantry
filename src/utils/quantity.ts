
import convert, { type Unit } from 'convert-units';
import type { UnitExtended } from '../lib/schemas/schema';

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
