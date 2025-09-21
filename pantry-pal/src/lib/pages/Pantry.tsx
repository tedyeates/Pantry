import { DataTable, type ColumnDefinition } from '@/lib/components/Table';
import type { DialogData, FormFieldExtended, Ingredient, PantryItem, UnitExtended } from '@/lib/schemas/schema';
import { useState } from 'react';
import DataDialog from '../components/Dialog';
import { Button } from '@/components/ui/button';
import { useFirestore } from '../context/Firebase';
import { reduceQuantity } from '@/utils/quantity';
import { getIngredientTypes, getLocations, getUnits } from '@/utils/options';


function Pantry() {
    const [dialog, setDialog] = useState<DialogData<Ingredient>>({
        title: '',
        description: '',
        initialData: undefined,
        dialogType: 'create',
        fields: []
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // const [removeQuantity, setRemoveQuantity] = useState(1);

    const { data, createData, updateData, deleteData } = useFirestore<Ingredient>();

    const pantryColumns: ColumnDefinition<Ingredient>[] = [
        { header: "Name", accessorKey: "name" },
        { header: "Quantity", accessorFn: (row) => `${row.quantity} ${row.unit}` },
        { header: "Type", accessorKey: "type" },
        { header: "Location", accessorKey: "location" },
        { header: "Created Date", accessorFn: (row) => row.createdDate?.toDate().toLocaleDateString()},
    ];

    const defaultPantryFormFields: FormFieldExtended[] = [
        { name: 'name', label: 'Ingredient Name', type: 'text', required: true, placeholder: 'e.g., Flour' },
        {
            name: 'type', label: 'Type', type: 'select', required: true, options: getIngredientTypes()
        },
        {
            name: 'location', label: 'Location', type: 'select', required: true, options: getLocations()
        },
    ];

    const createQuantityField: FormFieldExtended = { 
        name: 'quantity', label: 'Quantity', type: 'quantity', 
        min: 0, step: 0.01, required: true, 
        placeholder: 'e.g., 500', extraFields: [{
            name: 'unit', label: 'Unit', type: 'select', 
            options: getUnits(true)
        }]
    }

    const updateQuantityField: FormFieldExtended = {
        ...createQuantityField,
        type: 'reduceQuantity',
        extraFields: [{
            name: 'unit', label: 'Unit', type: 'select', 
            options: getUnits(true)
        },
        {
            name: 'reduce_quantity', label: 'Quantity', type: 'quantity', 
            min: 0, step: 0.01, required: false, 
            placeholder: 'e.g., 500', extraFields:[{
                name: 'reduce_unit', label: 'Unit', type: 'select',
                options: getUnits()
            }]
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
        setDialog({ 
            title: 'Edit Item', 
            dialogType: 'update', 
            initialData: ingredient, 
            fields: updateFields 
        });
        setIsDialogOpen(true);
    }

    const handleReduceQuantity = (data: PantryItem): PantryItem => {
        if (!("reduce_quantity" in data && "reduce_unit" in data)) return data;
        
        const { val, unit} = reduceQuantity(
            data.quantity, 
            data.unit, 
            data.reduce_quantity as number, 
            data.reduce_unit as UnitExtended
        )

        delete data.reduce_quantity;
        delete data.reduce_unit;

        return {
            ...data,
            quantity: val,
            unit: unit
        }
    }

    const handleSaveIngredient = async (data: Omit<PantryItem, 'id'>) => {
        data = handleReduceQuantity(data);

        try {
            if (dialog.dialogType === 'create') {
                await createData(data);
            }

            if (dialog.dialogType === 'update' && data.quantity <= 0) {
                await deleteData(dialog.initialData?.id as string | undefined);
            }
            else if (dialog.dialogType === 'update') {
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

            <DataDialog<PantryItem>
                isOpen={isDialogOpen}
                showModal={setIsDialogOpen}
                handleSave={handleSaveIngredient}
                {...dialog}
            />

            {data.length === 0 ? (
                <p className="text-center text-gray-600 text-lg mt-8">Your pantry is empty. Add some items!</p>
            ) : (
                <DataTable<Ingredient>
                    columns={pantryColumns}
                    data={data}
                    openEditDialog={openEditDialog}
                />
            )}
        </>
    )
}

export default Pantry