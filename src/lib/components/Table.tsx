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
import { convertFirebaseObject } from '@/utils/typeCoversion';
import type { FirebaseObject, InternalObject } from '../schemas/schema';
import type { JSX } from 'react';

// Define a generic interface for column definitions
// T is the type of the data object (e.g., PantryItem, Recipe)
export interface ColumnDefinition<T> {
    header: string; // The text to display in the table header
    accessorKey?: keyof T; // The key in the data object to access for this column
    // Optional function to custom render cell content, useful for formatting or nested data
    accessorFn?: (row: T) => React.ReactNode;
}

// Define the props for the DataTable component
interface DataTableProps<T, U> {
    columns: ColumnDefinition<T>[]; // Array of column definitions
    data: U[];
    openEditDialog: (item: T) => void;
    deleteData: (id: string) => Promise<void>;
    additionalActions?: (item: T) => JSX.Element;
}


export function DataTable<T extends InternalObject, U extends FirebaseObject>({ 
    columns, 
    data,
    openEditDialog,
    deleteData,
    additionalActions
}: DataTableProps<T, U>) { 
    const onDelete = async (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
        event.stopPropagation();
        await deleteData(id);
    }

    function tableRow(item: U, smallScreen: boolean = false) {
        const convertedItem = convertFirebaseObject<U, T>(item);

        if (smallScreen) {
            return (
                <div key={item.id} className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm">
                    <div onClick={() => openEditDialog(convertedItem)} className="space-y-3 mb-4">
                        {columns.map((column, colIndex) => (
                            <div key={colIndex} className="flex justify-between items-start text-sm">
                                <span className="font-semibold text-muted-foreground">{column.header}</span>
                                <span className="text-right break-all">
                                    {column.accessorFn ? column.accessorFn(convertedItem) : String(convertedItem[column.accessorKey!] ?? '')}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end border-t pt-4">
                        <Button variant="destructive" size="sm" onClick={(event) => onDelete(event, String(convertedItem.id))}>Delete</Button>
                        {additionalActions && additionalActions(convertedItem)}
                    </div>
                </div>
            )
        }

        return (
            <TableRow onClick={() => openEditDialog(convertedItem)} key={item.id} className="cursor-pointer hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                    <TableCell key={column.accessorKey?.toString() || colIndex}>
                        {column.accessorFn ? column.accessorFn(convertedItem) : String(convertedItem[column.accessorKey!] ?? '')}
                    </TableCell>
                ))}
                <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={(event) => onDelete(event, String(item.id))}>Delete</Button>
                    {additionalActions &&  additionalActions(convertedItem)}
                </TableCell>
            </TableRow>
        )
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
                        {data.length ? data.map((item) => tableRow(item)) : (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="text-center">No data available.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Card-based layout for small screens */}
            <div className="block sm:hidden space-y-4">
                {data.map((item) => tableRow(item, true))}
                {data.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No data available.</div>
                )}
            </div>
        </div>
    );
}