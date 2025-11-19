import ShoppingList from "../components/ShoppingList";
import type { FormFieldExtended } from "../schemas/schema";
import type { Ingredient } from "../schemas/shopSchema";

const OBJECT_TYPE = "ingredient"
function IngredientList() {
    const fields: FormFieldExtended[] = [
        { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Pantry' },
    ]

    return (
        <ShoppingList<Ingredient>
            objectType={OBJECT_TYPE}
            fields={fields}
        />
    )
}

export default IngredientList