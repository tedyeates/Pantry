import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { FormField, FormFieldExtended, SupportedFields } from "@/utils/schema";
import { useCallback, useEffect, useState } from "react";
import FieldSelect from "./fields/FieldSelect";
import FieldInput from "./fields/FieldInput";
import FieldQuantity from "./fields/FieldQuantity";
import FieldReduceQuantity from "./fields/FieldReduceQuantity";

type DataDialogueProps<T> = {
    isOpen: boolean;
    showModal: (open: boolean) => void;
    title: string;
    description?: string;
    fields: FormField[];
    initialData?: Partial<T>;
    submitButtonText?: string;
    handleSave: (data: Omit<T, 'id'>) => Promise<void>;
}

function DataDialog<T extends Record<string, SupportedFields>>({
    isOpen,
    showModal,
    title,
    description,
    fields,
    initialData,
    submitButtonText = 'Save',
    handleSave
}: DataDialogueProps<T>) {
    const [formData, setFormData] = useState<T>(initialData as T || {} as T);

    const getDefaultValues = useCallback((field: FormField): SupportedFields => {
        if (field.type === 'number')
            return 0;

        if (field.type === 'select' && field.options && field.options.length > 0)
            return field.options[0].value;

        return '';
    }, []);

    const getNewFieldData = useCallback((fields: FormFieldExtended[], newFormData: T) => {
        fields.forEach(field => {
            const initialValue = initialData && initialData[field.name]
            if (initialData && initialValue !== undefined) {
                newFormData[field.name as keyof T] = initialValue;
            } else {
                // Set default empty values based on type if no initialData
                newFormData[field.name as keyof T] = getDefaultValues(field) as T[keyof T];
            }
            if (field.extraFields && field.extraFields.length > 0) {
                newFormData = getNewFieldData(field.extraFields, newFormData);
            }

        });

        return newFormData
    }, [initialData, getDefaultValues]);

    // Effect to reset form data when modal opens or initialData changes
    useEffect(() => {
        // Initialize formData with initialData or default values for fields
        let newFormData: T = {} as T;
        newFormData = getNewFieldData(fields, newFormData);

        setFormData(newFormData);
    }, [isOpen, fields, getNewFieldData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'number' ? parseFloat(value) : value,
        }))
    }

    const handleSelectChange = (fieldName: string, value: string) => {
        setFormData((prevData) => ({
            ...prevData,
            [fieldName]: value,
        }));
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSave(formData);
    }

    function renderField(field: FormFieldExtended) {
        const fieldOptions = {
            "select": (
                <FieldSelect
                    field={field}
                    formData={formData}
                    handleSelectChange={handleSelectChange}
                    className="w-full"
                />
            ),
            "quantity": (
                <FieldQuantity
                    field={field}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    extraField={field.extraFields?.[0]}
                />
            ),
            "reduceQuantity": (
                <FieldReduceQuantity
                    field={field}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    extraFields={field.extraFields || []}
                />
            ),
            "default": (
                <FieldInput
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

    return (
        <Dialog open={isOpen} onOpenChange={() => showModal(false)}>
            <DialogContent className="sm:max-w-[425px] p-6 rounded-lg shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-indigo-700">{title}</DialogTitle>
                    {description && <DialogDescription className="text-gray-600">{description}</DialogDescription>}
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 py-4">
                {fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>{field.label}</Label>
                    {renderField(field)}
                    </div>
                ))}
                <Button type="submit" className="w-full mt-4">
                    {submitButtonText}
                </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default DataDialog