// src/components/ui/data-table.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'; // Adjust import path if necessary

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
  
}


// DataTable component
// It's a generic component, so you specify the type T when using it (e.g., DataTable<PantryItem>)
export function DataTable<T extends { id: string | number }>({ 
    columns, 
    data,
    openEditDialog
}: DataTableProps<T>) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                {columns.map((column, index) => (
                    <TableHead key={column.accessorKey?.toString() || index}>{column.header}</TableHead>
                ))}
                </TableRow>
            </TableHeader>
            <TableBody>
            {data.length ? (
                data.map((item) => (
                    <TableRow onClick={() => openEditDialog(item)} key={item.id}> {/* Assuming each data item has a unique 'id' */}
                        {columns.map((column, colIndex) => (
                        <TableCell key={column.accessorKey?.toString() || colIndex}>{column.accessorFn ? column.accessorFn(item) : item[column.accessorKey!] as string}</TableCell>
                        ))}
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={columns.length}>No data available.</TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
    );
}