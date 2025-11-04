import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FirebaseRecipe, FormFieldExtended, Ingredient, PantryRecipe } from "@/lib/schemas/schema";
import { type ColumnDefinition } from "../components/Table";
import { getUnits } from "@/utils/options";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Page from "../components/Page";

const RECIPE_OBJECT_TYPE = "recipe"

function Recipe() {
    const [viewRecipe, setViewRecipe] = useState<PantryRecipe | null>(null);

    const recipeColumns: ColumnDefinition<PantryRecipe>[] = [
        { header: "Name", accessorKey: "name" },
        {
            header: "Ingredients",
            accessorKey: "ingredients", 
            accessorFn: (item) => {
                const ingredientNames = item.ingredients
                    ?.map((ingredient: Ingredient) => ingredient.name)
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
                                            {item.ingredients.map((ingredient: Ingredient, index: number) => (
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
                                        <div className="font-medium whitespace-pre-wrap">{item.instructions}</div>
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
                options: getUnits()
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

    function additionalActions(item: PantryRecipe) {
        return <Button variant="outline" size="sm" className="ml-2" onClick={(event) => {
            event.stopPropagation();
            setViewRecipe(item);
        }}>View</Button>
    }

    return (
        <>
            <Page<PantryRecipe, FirebaseRecipe>
                object_type={RECIPE_OBJECT_TYPE}
                columns={recipeColumns}
                createFields={defaultRecipeFormFields}
                updateFields={defaultRecipeFormFields}
                additionalActions={additionalActions}
            />
            {viewRecipe && (
                <Dialog open={!!viewRecipe} onOpenChange={(isOpen) => !isOpen && setViewRecipe(null)}>
                    <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">{viewRecipe.name}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 space-y-6 max-h-[80vh] overflow-y-auto pr-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 border-b pb-1">Ingredients</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {viewRecipe.ingredients?.map((ingredient, index) => (
                                        <li key={index}>
                                            <span className="font-medium">{ingredient.name}</span>
                                            <span className="text-sm text-muted-foreground ml-1">({ingredient.quantity} {ingredient.unit})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2 border-b pb-1">Instructions</h3>
                                <div className="whitespace-pre-wrap text-sm">
                                    {viewRecipe.instructions}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}

export default Recipe
