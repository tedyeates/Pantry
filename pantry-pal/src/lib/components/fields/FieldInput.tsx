import { Input } from "@/components/ui/input"
import type { FormField } from "@/lib/schemas/schema"

type FieldInputProps<T> = {
    field: FormField;
    formData: T;
    handleInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    disabled?: boolean;
}

export default function FieldInput<T>({
    field, 
    formData, 
    handleInputChange,
    className = "",
    disabled = false
}: FieldInputProps<T>) {
    return (
        <Input
            id={field.name}
            name={field.name}
            type={field.type}
            value={String(formData[field.name as keyof T] || '')} // Ensure value is string for input
            onChange={handleInputChange}
            min={field.min}
            step={field.step}
            required={field.required}
            placeholder={field.placeholder}
            className={className}
            disabled={disabled}
        />
    )
}