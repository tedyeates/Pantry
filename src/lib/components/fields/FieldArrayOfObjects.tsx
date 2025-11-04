// File: d:\Projects\Pantry\pantry-pal\src\lib\components\fields\FieldArrayOfObjects.tsx
import type { FormField, FormFieldExtended, SupportedFields, SupportedObjects, UnitExtended } from '@/lib/schemas/schema';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // For better label styling
import Field from './Field';
import { convertUnit } from '@/utils/quantity';

// Helper to generate a default item based on subFields
function createDefaultItem<T>(subFields: FormFieldExtended[], item: T) {
    subFields.forEach(sf => {
        const key = sf.name as keyof T;
        if (sf.type === 'number') {
            item[key] = (sf.min ?? 0) as T[keyof T];
        } else if (sf.type === 'select' && sf.options?.length) {
            item[key] = String(sf.options[0].value) as T[keyof T]; // Ensure string value for select
        } else {
            item[key] = '' as T[keyof T]; // Default for text, textarea
        }

        if (sf.extraFields?.length) {
            item = createDefaultItem(sf.extraFields, item);
        }
    });
    return item;
};

interface FieldArrayOfObjectsProps<T> {
    field: FormFieldExtended; // Contains .name for the array and .subFields for item structure
    value: T[] | undefined;
    handleArrayOfObjectsChange: (newValues: SupportedObjects[]) => void;
    disabled?: boolean;
}

function FieldArrayOfObjects<T extends SupportedObjects>({
    field,
    value,
    handleArrayOfObjectsChange,
    disabled = false
}: FieldArrayOfObjectsProps<T>) {
    const items = value || [];
    const subFields = field.extraFields || [];

    const handleAddItem = () => {
        if (disabled) return;
        const newItem = createDefaultItem<T>(subFields, {} as T) as T;
        console.log(subFields)
        console.log(newItem)
        handleArrayOfObjectsChange([...items, newItem]);
    };

    const handleRemoveItem = (index: number) => {
        if (disabled) return;
        handleArrayOfObjectsChange(items.filter((_, i) => i !== index));
    };

    const handleItemInputChange = (
        itemIndex: number,
        subFieldName: string,
        inputValue: string, // Value from input event target is always string
        subFieldType?: FormField['type']
    ) => {
        if (disabled) return;
        const newItems = [...items];
        const currentItem: Record<string, SupportedFields> = { 
            ...(newItems[itemIndex] || {}) 
        }; // Ensure currentItem is an object

        let processedValue: SupportedFields = inputValue;
        if (subFieldType === 'number') {
            if (inputValue === '') {
                // Default to min value or 0 if input is cleared
                processedValue = subFields.find(sf => sf.name === subFieldName)?.min ?? 0;
            } else {
                const num = parseFloat(inputValue);
                // Fallback to min value or 0 if parsing fails
                processedValue = isNaN(num) ? (subFields.find(sf => sf.name === subFieldName)?.min ?? 0) : num;
            }
        }
        
        currentItem[subFieldName] = processedValue;
        newItems[itemIndex] = currentItem as T;
        handleArrayOfObjectsChange(newItems);
    };
    
    const handleItemSelectChange = (
        itemIndex: number,
        subFieldName: string,
        selectValue: string
    ) => {
        if (disabled) return;
        const newItems = [...items];
        const currentItem: Record<string, SupportedFields> = { 
            ...(newItems[itemIndex] || {}) 
        }; // Ensure currentItem is an object
        currentItem[subFieldName] = selectValue;
        newItems[itemIndex] = currentItem as T;
        handleArrayOfObjectsChange(newItems);
    };

    const handleUnitChange = (
        itemIndex: number,
        subFieldName: string,
        selectValue: UnitExtended
    ) => {
        if (disabled) return;

        const newItems = [...items];
        console.log(newItems)
        const currentItem: Record<string, SupportedFields> = { 
            ...(newItems[itemIndex] || {}) 
        }; // Ensure currentItem is an object
        const quantitFieldName = field.extraFields?.[1].name
        if (!quantitFieldName) return
        
        console.log(quantitFieldName)
        console.log(subFieldName)
        const oldUnit = currentItem[subFieldName] as UnitExtended;
        const quantity = currentItem[quantitFieldName] as number;

        console.log(oldUnit)
        console.log(quantity)
        console.log(selectValue)

        const {val, unit} = convertUnit(quantity, oldUnit, selectValue)
        
        currentItem[quantitFieldName] = val;
        currentItem[subFieldName] = unit;
        newItems[itemIndex] = currentItem as T;
        handleArrayOfObjectsChange(newItems);
    }

    if (!subFields.length) {
        return <p className="text-sm text-red-600">Configuration error: 'subFields' are not defined for the '{field.label}' array.</p>;
    }

    return (
        <div>
            <div className="max-h-72 overflow-y-auto space-y-3 pr-2 pb-2">
                {items.map((item, index) => ( // Add a border to all but the last item
                    <div key={index} className={index < items.length - 1 ? "border-b border-gray-200 pb-3" : ""}>
                        <div className="flex items-end gap-3"> {/* Flex container for sub-fields and button */}
                            {subFields.map((subField) => (
                                <div key={subField.name} className="flex-1 space-y-1 min-w-0"> {/* Each sub-field takes space, allows shrinking */}
                                    <Label htmlFor={`${field.name}-${index}-${subField.name}`} className="text-sm font-medium text-gray-700">
                                        {subField.label}
                                    </Label>
                                    <Field<T>
                                        field={subField}
                                        formData={item}
                                        handleInputChange={(e) => handleItemInputChange(index, e.target.name, e.target.value, subField.type)}
                                        handleUnitChange={(fieldName, value) => handleUnitChange(index, fieldName, value as UnitExtended)}
                                        handleSelectChange={(fieldName, value) => handleItemSelectChange(index, fieldName, value)}
                                        handleArrayOfObjectsChange={handleArrayOfObjectsChange}
                                        disabled={disabled}
                                    />
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveItem(index)}
                                disabled={disabled}
                                className="shrink-0" // Prevents button from shrinking too much
                            >
                                -
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddItem} 
                className="mt-2 border-dashed border-blue-500 text-blue-600 hover:bg-blue-50"
                disabled={disabled}
            >
                +
            </Button>
            {field.required && items.length === 0 && (
                <p className="text-xs text-red-600 mt-1">{field.label} requires at least one item.</p>
            )}
        </div>
    );
};

export default FieldArrayOfObjects;
