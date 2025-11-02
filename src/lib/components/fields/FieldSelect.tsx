import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FirebaseData, FormFieldExtended, PantryData } from "@/lib/schemas/schema";
import { useFirestore } from "@/lib/hooks/useFirestore";
import { useEffect, useState } from "react";
import type { SelectOption } from "@/lib/schemas/schema";

type FieldSelectProps<T> = {
    field: FormFieldExtended;
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
    const [options, setOptions] = useState<SelectOption[]>(field.options || []);
    const { data, syncData } = useFirestore<PantryData, FirebaseData>(field.relatedCollection || '');

    useEffect(() => {
        if (field.relatedCollection) {
            const unsubscribe = syncData();
            return () => unsubscribe && unsubscribe();
        }
    }, [field.relatedCollection, syncData]);

    useEffect(() => {
        if (field.relatedCollection && data.length > 0) {
            const newOptions = data.map(item => ({ label: item.name, value: item.name }));
            setOptions(newOptions);
        } else if (!field.relatedCollection) {
            setOptions(field.options || []);
        }
    }, [data, field.relatedCollection, field.options]);

    return (
        <Select
            name={field.name}
            value={String(formData[field.name as keyof T] || (options?.[0]?.value || ''))} // Ensure value is string
            onValueChange={(value) => handleSelectChange(field.name, value)}
            required={field.required}
            disabled={disabled}
        >
            <SelectTrigger className={className}>
                <SelectValue placeholder={field.placeholder || `Select a ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
                {options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}