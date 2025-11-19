"use client";

import { useEffect, useState } from "react";
import { useFirestore } from "../hooks/useFirestore";
import type { FormField, UnitExtended, FormFieldExtended } from "@/lib/schemas/schema";
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Field from "./fields/Field";
import { convertUnit } from "@/utils/quantity";
import type { FirebaseObject } from "../schemas/shopSchema";

type ShoppingListType = {
    fields: FormField[];
    objectType: string;
}

export default function ShoppingList<T extends {name: string}>({ fields, objectType }: ShoppingListType) {
    const [formData, setFormData] = useState<T>({} as T);
    const { data, createData, syncData } = useFirestore<T, T & FirebaseObject>(objectType);

    useEffect(() => {
        const unsubscribe = syncData();
        return () => unsubscribe && unsubscribe();
    }, [syncData]);

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
    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    return (
        <div>
            {data.length && data.map((item) => (
                <div className="flex items-center gap-3">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">{item.name}</Label>
                </div>
            ))}
            <div className="grid w-full max-w-sm items-center gap-3">
                {fields.map((field) => (
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
                ))}
                <Button onClick={() => createData({...formData, createdDate: new Date()})} className="shadow-md"> {/* Added subtle shadow for visual depth */}
                    Add New Item
                </Button>
            </div>
        </div>
    );
}
