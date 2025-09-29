import type { DialogData, FormFieldExtended, Recipe } from "@/lib/schemas/schema";
import { useState } from "react";
import { useFirestore } from "../context/Firebase";
import { DataTable, type ColumnDefinition } from "../components/Table";
import { Button } from "@/components/ui/button";
import DataDialog from "../components/Dialog";
import { getUnits } from "@/utils/options";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const RECIPE_OBJECT_TYPE = "recipe"

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
        {
            header: "Ingredients",
            accessorKey: "ingredients", 
            accessorFn: (item) => {
                const ingredientNames = item.ingredients
                    ?.map((ingredient) => ingredient.name)
                    .join(', ');

                const displaySummary = ingredientNames?.length > 40
                    ? `${ingredientNames.substring(0, 37)}...`
                    : ingredientNames || 'N/A';

                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                {displaySummary}
                                {item.ingredients && item.ingredients.length > 0 && (
                                    <TooltipContent className="p-2 text-left shadow-lg">
                                        <h4 className="font-semibold mb-1 text-sm">Full Ingredients:</h4>
                                        <ul className="list-disc list-inside space-y-0.5 text-xs">
                                            {item.ingredients.map((ingredient, index) => (
                                            <li key={index}>
                                                <span className="font-medium">{ingredient.name}</span>
                                                <span className="ml-0.5">({ingredient.quantity} {ingredient.unit})</span>
                                            </li>
                                            ))}
                                        </ul>
                                    </TooltipContent>
                                )}
                                </span>
                            </TooltipTrigger>
                        </Tooltip>
                    </TooltipProvider>
                );
            }
        },
        { 
            header: "Instructions", 
            accessorKey: "instructions",
            accessorFn: (item) => {
                const displaySummary = item.instructions?.length > 40
                    ? `${item.instructions.substring(0, 37)}...`
                    : item.instructions || 'N/A';

                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                {displaySummary}
                                {item.instructions && item.instructions.length > 0 && (
                                    <TooltipContent className="p-2 text-left shadow-lg">
                                        <h4 className="font-semibold mb-1 text-sm">Full Instructions</h4>
                                        <ul className="list-disc list-inside space-y-0.5 text-xs">
                                            <span className="font-medium">{item.instructions}</span>
                                        </ul>
                                    </TooltipContent>
                                )}
                                </span>
                            </TooltipTrigger>
                        </Tooltip>
                    </TooltipProvider>
                );
            }
        },
    ];

    const ingredientSubFields: FormFieldExtended[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            placeholder: 'e.g., Flour',
            required: true
        },
        {
            name: 'quantity',
            label: 'Quantity',
            type: 'quantity',
            required: true,
            min: 0,
            step: 0.01,
            placeholder: 'e.g., 500',
            extraFields: [{
                name: 'unit', label: 'Unit', type: 'select', 
                options: getUnits(true)
            }]
        }
    ]

    const defaultRecipeFormFields: FormFieldExtended[] = [
        { 
            name: 'name', label: 'Name', type: 'text', 
            required: true, placeholder: 'e.g., Katsu Curry' 
        },
        {
            name: 'ingredients', label: 'Ingredients', type: 'arrayOfObjects', 
            required: true, relatedCollection: 'pantry', extraFields: ingredientSubFields
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
                await createData(data, RECIPE_OBJECT_TYPE);
            }
            else if (dialog.dialogType === 'update') {
                await updateData(
                    data, 
                    RECIPE_OBJECT_TYPE,
                    dialog.initialData?.id as string | undefined
                );
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
                    objectType="recipe"
                />
            )}
        </>
    )
}

export default Recipes
