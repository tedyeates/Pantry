import { Textarea } from "@/components/ui/textarea";
import type { FormField } from "@/lib/schemas/schema"

type FieldTextareaProps<T> = {
    field: FormField;
    formData: T;
    handleInputChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    className?: string;
    disabled?: boolean;
}

export default function FieldTextarea<T>({
    field, 
    formData, 
    handleInputChange,
    className = "",
    disabled = false
}: FieldTextareaProps<T>) {
    return (
        <Textarea
            id={field.name}
            name={field.name}
            value={String(formData[field.name as keyof T] || '')} // Ensure value is string for input
            onChange={handleInputChange}
            required={field.required}
            placeholder={field.placeholder}
            className={className}
            disabled={disabled}
        />
    )
}