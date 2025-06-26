import type { FormFieldExtended } from "@/lib/schemas/schema";
import FieldQuantity from "./FieldQuantity";

type FieldReduceQuantityProps<T> = {
    field: FormFieldExtended;
    formData: T;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (fieldName: string, value: string) => void;

    className?: string;
    disabled?: boolean;
    extraFields: FormFieldExtended[]
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
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                className={className}
                disabled={disabled}
                extraField={extraFields[0]}
            />

            <span className="text-2xl font-bold text-gray-700 mx-auto">-</span>

            {/* Reduced Quantity Field */}
            <FieldQuantity<T>
                field={extraFields[1]}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                className={className}
                disabled={disabled}
                extraField={extraFields[1].extraFields?.[0]}
            />
        </div>
    )
}