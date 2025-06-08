import { DataTable, type ColumnDefinition } from '@/lib/components/Table';
import type { FormFieldExtended, Ingredient } from '@/utils/schema';
import { useState } from 'react';
import DataDialog from '../components/Dialog';
import { Button } from '@/components/ui/button';
import { useFirestore } from '../context/Firebase';


type DialogData = {
    title: string;
    description?: string;
    initialData?: Partial<Ingredient>;
    dialogType: 'create' | 'update';
    fields: FormFieldExtended[];

}

function Pantry() {
    const [dialog, setDialog] = useState<DialogData>({
        title: '',
        description: '',
        initialData: undefined,
        dialogType: 'create',
        fields: []
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // const [removeQuantity, setRemoveQuantity] = useState(1);

    const { data, createData, updateData } = useFirestore<Ingredient>();

    const pantryColumns: ColumnDefinition<Ingredient>[] = [
        { header: "Name", accessorKey: "name" },
        { header: "Quantity", accessorFn: (row) => `${row.quantity} ${row.unit}` },
        { header: "Type", accessorKey: "type" },
        { header: "Location", accessorKey: "location" },
        // Add more columns as needed
    ];

    const defaultPantryFormFields: FormFieldExtended[] = [
        { name: 'name', label: 'Food Name', type: 'text', required: true, placeholder: 'e.g., Chicken Breast' },
        {
            name: 'type', label: 'Type', type: 'select', required: true, options: [
                { value: 'Vegetable', label: 'Vegetable' },
                { value: 'Meat', label: 'Meat' },
                { value: 'Carbohydrate', label: 'Carbohydrate' },
                { value: 'Dairy', label: 'Dairy' },
                { value: 'Fruit', label: 'Fruit' },
                { value: 'Spice', label: 'Spice' },
                { value: 'Condiment', label: 'Condiment' },
                { value: 'Other', label: 'Other' },
            ]
        },
        {
            name: 'location', label: 'Location', type: 'select', required: true, options: [
                { value: 'Pantry', label: 'Pantry' },
                { value: 'Fridge', label: 'Fridge' },
                { value: 'Freezer', label: 'Freezer' },
                { value: 'Cupboard', label: 'Cupboard' },
            ]
        },
    ];

    const createQuantityField: FormFieldExtended = { 
        name: 'quantity', label: 'Quantity', type: 'quantity', 
        min: 0, step: 0.01, required: true, 
        placeholder: 'e.g., 500', extraFields: [{
            name: 'unit', label: 'Unit', type: 'select', 
            options: [
                { value: 'g', label: 'g' },
                { value: 'kg', label: 'kg' },
                { value: 'ml', label: 'ml' },
                { value: 'l', label: 'L' },
                { value: 'unit', label: 'unit(s)' },
            ]
        }]
    }

    const updateQuantityField: FormFieldExtended = {
        ...createQuantityField,
        type: 'reduceQuantity',
        extraFields: [{
            name: 'unit', label: 'Unit', type: 'select', 
            options: [
                { value: 'g', label: 'g' },
                { value: 'kg', label: 'kg' },
                { value: 'ml', label: 'ml' },
                { value: 'l', label: 'L' },
                { value: 'unit', label: 'unit(s)' },
            ]  
        },
        {
            name: 'unit', label: 'Unit', type: 'select',
            options: [
                { value: 'g', label: 'g' },
                { value: 'kg', label: 'kg' },
                { value: 'ml', label: 'ml' },
                { value: 'l', label: 'L' },
                { value: 'unit', label: 'unit(s)' },
                { value: 'Tbs', label: 'tbsp' },
                { value: 'tsp', label: 'tsp' },
                { value: 'pinch', label: 'pinch' },
                { value: 'cup' , label: 'cup' },
                { value: 'oz', label: 'oz' },
                { value: 'lb', label: 'lb' },
            ]
        }]
    }

    const creatFields: FormFieldExtended[] = [
        ...defaultPantryFormFields,
        createQuantityField
    ]

    const updateFields: FormFieldExtended[] = [
        ...defaultPantryFormFields,
        updateQuantityField
    ]  

    const openCreateDialog = () => {
        setDialog({ 
            title: 'Add Item', 
            dialogType: 'create', 
            fields: creatFields 
        });
        setIsDialogOpen(true);
    }

    const openEditDialog = (ingredient: Ingredient) => {
        console.log(ingredient)
        setDialog({ 
            title: 'Edit Item', 
            dialogType: 'update', 
            initialData: ingredient, 
            fields: updateFields 
        });
        setIsDialogOpen(true);
    }

    const handleSaveIngredient = async (data: Omit<Ingredient, 'id'>) => {
        try {
            if (dialog.dialogType === 'create') {
                await createData(data);
            }

            if (dialog.dialogType === 'update') {
                await updateData(data, dialog.initialData?.id as string | undefined);
            }

            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    }

    return (
        <>
            {/* This div acts as a flexible container for the button */}
            <div className="flex justify-end mb-4"> {/* flex container, pushes content to end (right), adds bottom margin */}
                <Button onClick={() => openCreateDialog()} className="shadow-md"> {/* Added subtle shadow for visual depth */}
                    Add New Item
                </Button>
            </div>

            <DataDialog<Ingredient>
                isOpen={isDialogOpen}
                showModal={setIsDialogOpen}
                handleSave={handleSaveIngredient}
                {...dialog}
            />

            {data.length === 0 ? (
                <p className="text-center text-gray-600 text-lg mt-8">Your pantry is empty. Add some items!</p>
            ) : (
                <DataTable
                    columns={pantryColumns}
                    data={data}
                    openEditDialog={openEditDialog}
                />
            )}
        </>
    )
}

export default Pantry