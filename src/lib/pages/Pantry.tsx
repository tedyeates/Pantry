import { type ColumnDefinition } from '@/lib/components/Table';
import type { FirebaseIngredient, PantryIngredient } from '@/lib/schemas/schema';
import { createFields, updateFields } from '@/utils/fieldData';
import Page from '../components/Page';


const PANTRY_OBJECT_TYPE = "pantry"
function Pantry() {
    const pantryColumns: ColumnDefinition<PantryIngredient>[] = [
        { header: "Name", accessorKey: "name" },
        { header: "Quantity", accessorFn: (row) => `${row.quantity} ${row.unit}` },
        { header: "Type", accessorKey: "type" },
        { header: "Location", accessorKey: "location" },
        { header: "Created Date", accessorFn: (row) => row.createdDate.toLocaleDateString() },
    ];


    return (
        <Page<PantryIngredient, FirebaseIngredient>
            object_type={PANTRY_OBJECT_TYPE}
            columns={pantryColumns}
            createFields={createFields}
            updateFields={updateFields}
        />
    )
}

export default Pantry