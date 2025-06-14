import type { FormField, FormFieldExtended, UnitExtended } from "@/utils/schema";
import FieldSelect from "./FieldSelect";
import FieldInput from "./FieldInput";

type FieldQuantityProps<T> = {
    field: FormFieldExtended;
    extraField?: FormField;
    formData: T;
    handleInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleUnitChange: (
        quantity: number, 
        oldUnit: UnitExtended, 
        newUnit: UnitExtended,
        field: FormFieldExtended
    ) => void;
    className?: string;
    disabled?: boolean;
}

export default function FieldQuantity<T>({
    field,
    extraField,
    formData, 
    handleInputChange,
    handleUnitChange,
    className="",
    disabled = false
}: FieldQuantityProps<T>) {
    return (
        <div className="flex items-end gap-2">
            <FieldInput<T> 
                field={field} 
                formData={formData} 
                handleInputChange={handleInputChange} 
                className={className}
                disabled={disabled}
            />
            <FieldSelect<T>
                field={extraField as FormField}
                formData={formData}
                handleSelectChange={(fieldName, value) => handleUnitChange(
                    formData[field.name as keyof T] as number, 
                    formData[fieldName as keyof T] as UnitExtended, 
                    value as UnitExtended,
                    field
                )}
                className={className}
            />
        </div>
    )
}