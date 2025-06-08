import type { FormField, FormFieldExtended } from "@/utils/schema";
import FieldSelect from "./FieldSelect";
import FieldInput from "./FieldInput";

type FieldQuantityProps<T> = {
    field: FormFieldExtended;
    extraField?: FormField;
    formData: T;
    handleInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (fieldName: string, value: string) => void;
    className?: string;
    disabled?: boolean;
}

export default function FieldQuantity<T>({
    field,
    extraField,
    formData, 
    handleInputChange,
    handleSelectChange,
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
                handleSelectChange={handleSelectChange}
                className={className}
            />
        </div>
    )
}