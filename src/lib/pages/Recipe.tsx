import type { FirebaseRecipe, FormFieldExtended, Ingredient, PantryRecipe } from "@/lib/schemas/schema";
import { type ColumnDefinition } from "../components/Table";
import { getUnits } from "@/utils/options";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Page from "../components/Page";

const RECIPE_OBJECT_TYPE = "recipe"

function Recipe() {
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

    return (
        <Page<PantryRecipe, FirebaseRecipe>
            object_type={RECIPE_OBJECT_TYPE}
            columns={recipeColumns}
            createFields={defaultRecipeFormFields}
            updateFields={defaultRecipeFormFields}
        />
    )
}

export default Recipe
