import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FormField } from "@/utils/schema";

type FieldSelectProps<T> = {
    field: FormField;
    formData: T;
    handleSelectChange: (fieldName: string, value: string) => void;
    className?: string
    disabled?: boolean
}

export default function FieldSelect<T>({
    field, 
    formData, 
    handleSelectChange,
    className = "",
    disabled = false
}: FieldSelectProps<T>) {
    return (
        <Select
            name={field.name}
            value={String(formData[field.name as keyof T] || (field.options?.[0]?.value || ''))} // Ensure value is string
            onValueChange={(value) => handleSelectChange(field.name, value)}
            required={field.required}
            disabled={disabled}
        >
            <SelectTrigger className={className}>
                <SelectValue placeholder={field.placeholder || `Select a ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
                {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                    {option.label}
                </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}