import { DataTable, type ColumnDefinition } from '@/lib/components/Table';
import type { Ingredient } from '@/utils/schema';

function Pantry() {

    const pantryColumns: ColumnDefinition<Ingredient>[] = [
        { header: "Name", accessorKey: "name" },
        { header: "Quantity", accessorFn: (row) => `${row.quantity} ${row.unit}` },
        { header: "Category", accessorKey: "category" },
        { header: "Location", accessorKey: "location" },
        // Add more columns as needed
    ];

    const pantryRows: Ingredient[] = [
        {
            id: "1",
            name: "Milk",
            quantity: 1,
            unit: "L",
            category: "Dairy",
            location: "Fridge"
        },
        {
            id: "2",
            name: "Ice Cream",
            quantity: 300,
            unit: "g",
            category: "Frozen",
            location: "Freezer"
        },
        {
            id: "3",
            name: "Bread",
            quantity: 0.5,
            unit: "kg",
            category: "Bakery",
            location: "Cupboard"
        },
        // Add more items as needed
    ]

    return (
        <>
            {pantryRows.length === 0 ? (
                <p className="text-center text-gray-600 text-lg mt-8">Your pantry is empty. Add some items!</p>
            ) : (
                <DataTable columns={pantryColumns} data={pantryRows} />
            )}
        </>
    )
}

export default Pantry