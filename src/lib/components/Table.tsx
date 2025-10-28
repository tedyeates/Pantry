// src/components/ui/data-table.tsx
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useFirestore } from '../hooks/useFirestore';

// Define a generic interface for column definitions
// T is the type of the data object (e.g., PantryItem, Recipe)
export interface ColumnDefinition<T> {
    header: string; // The text to display in the table header
    accessorKey?: keyof T; // The key in the data object to access for this column
    // Optional function to custom render cell content, useful for formatting or nested data
    accessorFn?: (row: T) => React.ReactNode;
}

// Define the props for the DataTable component
interface DataTableProps<T> {
    columns: ColumnDefinition<T>[]; // Array of column definitions
    data: T[];
    openEditDialog: (item: T) => void;
    objectType: string;
}


// DataTable component
// It's a generic component, so you specify the type T when using it (e.g., DataTable<PantryItem>)
export function DataTable<T extends { id: string }>({ 
    columns, 
    data,
    openEditDialog,
    objectType
}: DataTableProps<T>) { 
    const { deleteData } = useFirestore<T>(objectType);

    const onDelete = async (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
        event.stopPropagation();
        await deleteData(id);
    }
    
    return (
        <div className="w-full">
            {/* Standard Table for medium screens and up */}
            <div className="hidden sm:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableHead key={column.accessorKey?.toString() || index}>{column.header}</TableHead>
                            ))}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length ? data.map((item) => (
                            <TableRow onClick={() => openEditDialog(item)} key={item.id} className="cursor-pointer hover:bg-gray-50">
                                {columns.map((column, colIndex) => (
                                    <TableCell key={column.accessorKey?.toString() || colIndex}>
                                        {column.accessorFn ? column.accessorFn(item) : String(item[column.accessorKey!] ?? '')}
                                    </TableCell>
                                ))}
                                <TableCell className="text-right">
                                    <Button variant="destructive" size="sm" onClick={(event) => onDelete(event, String(item.id))}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="text-center">No data available.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Card-based layout for small screens */}
            <div className="block sm:hidden space-y-4">
                {data.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm">
                        <div onClick={() => openEditDialog(item)} className="space-y-3 mb-4">
                            {columns.map((column, colIndex) => (
                                <div key={colIndex} className="flex justify-between items-start text-sm">
                                    <span className="font-semibold text-muted-foreground">{column.header}</span>
                                    <span className="text-right break-all">
                                        {column.accessorFn ? column.accessorFn(item) : String(item[column.accessorKey!] ?? '')}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end border-t pt-4">
                            <Button variant="destructive" size="sm" onClick={(event) => onDelete(event, String(item.id))}>Delete</Button>
                        </div>
                    </div>
                ))}
                {data.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No data available.</div>
                )}
            </div>
        </div>
    );
}