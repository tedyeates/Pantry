import type { FormField, FormFieldExtended } from "@/utils/schema";
import FieldQuantity from "./FieldQuantity";

type FieldReduceQuantityProps<T> = {
    field: FormFieldExtended;
    formData: T;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (fieldName: string, value: string) => void;
    className?: string;
    disabled?: boolean;
    extraFields: FormField[]
}
export default function FieldReduceQuantity<T>({
    field, 
    formData, 
    handleInputChange,
    handleSelectChange,
    className="",
    disabled=false,
    extraFields
}: FieldReduceQuantityProps<T>){
    return (
        <div className="flex flex-col gap-2">
            {/* Initial Quantity Field */}
            <FieldQuantity<T>
                field={field}
                formData={formData}
                handleSelectChange={handleSelectChange}
                className={className}
                disabled={true}
                extraField={extraFields[0]}
            />

            <span className="text-2xl font-bold text-gray-700 mx-auto">-</span>

            {/* Reduced Quantity Field */}
            <FieldQuantity<T>
                field={field}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                className={className}
                disabled={disabled}
                extraField={extraFields[1]}
            />
        </div>
    )
}