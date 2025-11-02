import Page from "../components/Page";
import type { ColumnDefinition } from "../components/Table";
import type { FirebaseData, FormFieldExtended, PantryData } from "../schemas/schema";

const OBJECT_TYPE = "ingredientType"
function IngredientType() {
    const locationColumns: ColumnDefinition<PantryData>[] = [
        { header: "Name", accessorKey: "name" },
        { header: "Created Date", accessorFn: (row) => row.createdDate.toLocaleDateString() },
    ];

    const fields: FormFieldExtended[] = [
        { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Aldi' },
    ]

    return (
        <Page<PantryData, FirebaseData>
            object_type={OBJECT_TYPE}
            columns={locationColumns}
            createFields={fields}
            updateFields={fields}
        />
    )
}

export default IngredientType