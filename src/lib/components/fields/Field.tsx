import type { FormFieldExtended, SupportedObjects } from "@/lib/schemas/schema";
import FieldArrayOfObjects from "./FieldArrayOfObjects";
import FieldInput from "./FieldInput";
import FieldQuantity from "./FieldQuantity";
import FieldReduceQuantity from "./FieldReduceQuantity";
import FieldSelect from "./FieldSelect";
import FieldTextarea from "./FieldTextarea";

type FieldProps<T> = {
    field: FormFieldExtended;
    formData: T;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleUnitChange: (fieldName: string, value: string) => void;
    handleSelectChange: (fieldName: string, value: string) => void;
    handleArrayOfObjectsChange: (newValues: SupportedObjects[]) => void;
    className?: string;
    disabled?: boolean;
}

export default function Field<T>({
    field, 
    formData, 
    handleInputChange,
    handleUnitChange,
    handleSelectChange,
    handleArrayOfObjectsChange
} : FieldProps<T>) {

    function renderField() {
        const fieldOptions = {
            "select-firebase": (
                <FieldSelect
                    key={field.name}
                    field={field}
                    formData={formData}
                    handleSelectChange={handleSelectChange}
                    className="w-full"
                />
            ),
            "select": (
                <FieldSelect
                    key={field.name}
                    field={field}
                    formData={formData}
                    handleSelectChange={handleSelectChange}
                    className="w-full"
                />
            ),
            "quantity": (
                <FieldQuantity<T>
                    key={field.name}
                    field={field}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleUnitChange}
                    extraField={field.extraFields?.[0]}
                />
            ),
            "reduceQuantity": (
                <FieldReduceQuantity<T>
                    key={field.name}
                    field={field}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleUnitChange}
                    extraFields={field.extraFields || []}
                />
            ),
            "arrayOfObjects": (
                <FieldArrayOfObjects<SupportedObjects>
                    key={field.name}
                    field={field}
                    value={formData[field.name as keyof T] as SupportedObjects[]}    
                    handleArrayOfObjectsChange={handleArrayOfObjectsChange}
                />
            ),
            "textarea": (
                <FieldTextarea<T>
                    key={field.name}
                    field={field}
                    formData={formData}
                    handleInputChange={handleInputChange}
                />
            ),
            "default": (
                <FieldInput<T>
                    key={field.name}
                    field={field}
                    formData={formData}
                    handleInputChange={handleInputChange}
                />
            )
        }

        if (field.type in fieldOptions) {
            return fieldOptions[field.type as keyof typeof fieldOptions];
        }

        return fieldOptions["default"];
    }

    return renderField();

}