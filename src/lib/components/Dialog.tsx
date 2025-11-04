import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { FormField, FormFieldExtended, SupportedFields, UnitExtended } from "@/lib/schemas/schema";
import { useCallback, useEffect, useState } from "react";
import { convertUnit } from "@/utils/quantity";
import Field from "./fields/Field";

type DataDialogueProps<T> = {
    isOpen: boolean;
    showModal: (open: boolean) => void;
    title: string;
    description?: string;
    fields: FormField[];
    initialData?: Partial<T>;
    submitButtonText?: string;
    handleSave: (data: T) => Promise<void>;
}

function DataDialog<T>({
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
            const initialValue = initialData && initialData[field.name as keyof T]
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'number' ? parseFloat(value) : value,
        }))
    }

    const handleUnitChange = (
        quantity: number, 
        oldUnit: UnitExtended, 
        newUnit: UnitExtended,
        field: FormFieldExtended
    ) => {
        const unitFieldName = field.extraFields?.[0].name
        if (!unitFieldName) return

        const {val, unit} = convertUnit(quantity, oldUnit, newUnit)
        setFormData((prevData) => ({
            ...prevData,
            [field.name]: val,
            [unitFieldName]: unit
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
        handleSave({...formData, createdDate: new Date()});
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => showModal(false)}>
            <DialogContent className="sm:max-w-[600px] p-6 rounded-lg shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-indigo-700">{title}</DialogTitle>
                    {description && <DialogDescription className="text-gray-600">{description}</DialogDescription>}
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 py-4">
                {fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>{field.label}</Label>
                    <Field<T>
                        field={field}
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleUnitChange={(fieldName, value) => handleUnitChange(
                            formData[field.name as keyof T] as number, 
                            formData[fieldName as keyof T] as UnitExtended, 
                            value as UnitExtended,
                            field
                        )}
                        handleSelectChange={handleSelectChange}
                        handleArrayOfObjectsChange={(newValues) => {
                            setFormData((prevData) => ({
                                ...prevData,
                                [field.name]: newValues,
                            }));
                        }}
                    />
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