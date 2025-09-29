export const getIngredientTypes = () => {
    return [
        { value: 'Vegetable', label: 'Vegetable' },
        { value: 'Meat', label: 'Meat' },
        { value: 'Carbohydrate', label: 'Carbohydrate' },
        { value: 'Dairy', label: 'Dairy' },
        { value: 'Fruit', label: 'Fruit' },
        { value: 'Spice', label: 'Spice' },
        { value: 'Condiment', label: 'Condiment' },
        { value: 'Other', label: 'Other' },
    ]
}

export const getLocations = () => {
    return [
        { value: 'Pantry', label: 'Pantry' },
        { value: 'Fridge', label: 'Fridge' },
        { value: 'Freezer', label: 'Freezer' },
        { value: 'Cupboard', label: 'Cupboard' },
    ]
}

export const getShops = () => {
    return [
        { value: '-----', label: '-----' },
        { value: 'Lidl', label: 'Lidl' },
        { value: 'Aldi', label: 'Aldi' },
        { value: 'Tesco', label: 'Tesco' },
        { value: 'Asda', label: 'Asda' },
    ]
}

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
        { value: 'unit', label: 'unit(s)' },
        { value: 'Tbs', label: 'tbsp' },
        { value: 'tsp', label: 'tsp' },
        { value: 'cup' , label: 'cup' },
    ]
}