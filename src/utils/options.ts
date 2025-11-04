export const getUnits = (isStorage: boolean = false) => {
    const storageUnits = [
        { value: 'g', label: 'g' },
        { value: 'kg', label: 'kg' },
        { value: 'ml', label: 'ml' },
        { value: 'l', label: 'L' },
        { value: 'oz', label: 'oz' },
        { value: 'lb', label: 'lb' },
        { value: 'unit', label: 'unit(s)' },
    ]

    if (isStorage) {
        return storageUnits
    }

    return [
        ...storageUnits,
        { value: 'Tbs', label: 'tbsp' },
        { value: 'tsp', label: 'tsp' },
        { value: 'cup' , label: 'cup' },
    ]
}