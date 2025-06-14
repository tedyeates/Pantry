import type { DialogData, FormFieldExtended, Recipe } from "@/utils/schema";
import { useState } from "react";
import { useFirestore } from "../context/Firebase";
import { DataTable, type ColumnDefinition } from "../components/Table";
import { Button } from "@/components/ui/button";
import DataDialog from "../components/Dialog";

function Recipes() {
    const [dialog, setDialog] = useState<DialogData<Recipe>>({
        title: '',
        description: '',
        initialData: undefined,
        dialogType: 'create',
        fields: []
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // const [removeQuantity, setRemoveQuantity] = useState(1);

    const { data, createData, updateData } = useFirestore<Recipe>();

    const recipeColumns: ColumnDefinition<Recipe>[] = [
        { header: "Name", accessorKey: "name" },
        { header: "Ingredients", accessorKey: "ingredients" },
        { header: "Instructions", accessorKey: "instructions" },
        // Add more columns as needed
    ];

    const defaultRecipeFormFields: FormFieldExtended[] = [
        { 
            name: 'name', label: 'Recipe Name', type: 'text', 
            required: true, placeholder: 'e.g., Katsu Curry' 
        },
        {
            name: 'ingredients', label: 'Ingredients', type: 'select', 
            required: false, options: [], relatedCollection: 'pantry'
        },
        {
            name: 'instructions', label: 'Instructions', type: 'textarea', 
            required: false, 
            placeholder: 'e.g., Chop carrots, chop onions...etc'
        },
    ];

    const openCreateDialog = () => {
        setDialog({ 
            title: 'Add Recipe', 
            dialogType: 'create', 
            fields: defaultRecipeFormFields 
        });
        setIsDialogOpen(true);
    }

    const openEditDialog = (recipe: Recipe) => {
        setDialog({ 
            title: 'Edit Item', 
            dialogType: 'update', 
            initialData: recipe, 
            fields: defaultRecipeFormFields 
        });
        setIsDialogOpen(true);
    }

    const handleSaveIngredient = async (data: Omit<Recipe, 'id'>) => {
        try {
            if (dialog.dialogType === 'create') {
                await createData(data);
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

            <DataDialog<Recipe>
                isOpen={isDialogOpen}
                showModal={setIsDialogOpen}
                handleSave={handleSaveIngredient}
                {...dialog}
            />

            {data.length === 0 ? (
                <p className="text-center text-gray-600 text-lg mt-8">Your pantry is empty. Add some items!</p>
            ) : (
                <DataTable
                    columns={recipeColumns}
                    data={data}
                    openEditDialog={openEditDialog}
                />
            )}
        </>
    )
}

export default Recipes