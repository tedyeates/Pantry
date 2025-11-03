import { DataTable, type ColumnDefinition } from '@/lib/components/Table';
import type { DialogData, FirebaseObject, FormFieldExtended, InternalObject } from '@/lib/schemas/schema';
import { useEffect, useState } from 'react';
import DataDialog from '../components/Dialog';
import { Button } from '@/components/ui/button';
import { useFirestore } from '../hooks/useFirestore';

type PageProps<T> = {
    object_type: string
    columns: ColumnDefinition<T>[]
    createFields: FormFieldExtended[]
    updateFields: FormFieldExtended[]
    handleSave?: (data: T) => Promise<void>
}
// T Pantry Ingredient
// U Firebase Ingredient
function Page<T extends InternalObject, U extends FirebaseObject>({
    object_type, 
    columns,
    createFields,
    updateFields,
    handleSave
}: PageProps<T>) {
    const [dialog, setDialog] = useState<DialogData<T>>({
        title: '',
        description: '',
        initialData: undefined,
        dialogType: 'create',
        fields: []
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // const [removeQuantity, setRemoveQuantity] = useState(1);

    const { data, createData, updateData, deleteData, syncData } = useFirestore<T, U>(object_type);

    useEffect(() => {
        const unsubscribe = syncData();
        return () => unsubscribe && unsubscribe();
    }, [syncData]);



    const openCreateDialog = () => {
        setDialog({ 
            title: 'Add Item', 
            dialogType: 'create', 
            fields: createFields 
        });
        setIsDialogOpen(true);
    }

    const openEditDialog = (item: T) => {
        setDialog({ 
            title: 'Edit Item', 
            dialogType: 'update', 
            initialData: item, 
            fields: updateFields 
        });
        setIsDialogOpen(true);
    }

    const handleSaveDefault = async (data: T & {quantity?: number}) => {
        try {
            if (dialog.dialogType === 'create') {
                await createData(data);
            }

            if (!dialog.initialData?.id) {
                setIsDialogOpen(false);
                return;
            }

            if (dialog.dialogType === 'update' && data?.quantity && data.quantity <= 0) {
                await deleteData(dialog.initialData.id);
            }

            if (dialog.dialogType === 'update') {
                await updateData(
                    dialog.initialData!.id,
                    data
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

            <DataDialog<T>
                isOpen={isDialogOpen}
                showModal={setIsDialogOpen}
                handleSave={handleSave ? handleSave : handleSaveDefault}
                {...dialog}
            />

            {data.length === 0 ? (
                <p className="text-center text-gray-600 text-lg mt-8">Your pantry is empty. Add some items!</p>
            ) : (
                <DataTable<T, U>
                    columns={columns}
                    data={data}
                    openEditDialog={openEditDialog}
                    deleteData={deleteData}
                />
            )}
        </>
    )
}

export default Page