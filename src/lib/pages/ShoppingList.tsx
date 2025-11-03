"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useFirestore } from "../hooks/useFirestore";
import type { ShoppingListItem, FirebaseShoppingListItem, UnitExtended } from "@/lib/schemas/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { convertFirebaseObject } from "@/utils/typeCoversion";
import { getUnits } from "@/utils/options";
import { Trash2 } from "lucide-react";

const SHOPPING_LIST_OBJECT_TYPE = "shoppingList";

export default function ShoppingList() {
    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [newItemName, setNewItemName] = useState("");
    const [newItemQuantity, setNewItemQuantity] = useState<number | string>(1);
    const [newItemUnit, setNewItemUnit] = useState<UnitExtended>('unit');
    const { data, createData, syncData, deleteData } = useFirestore<ShoppingListItem, FirebaseShoppingListItem>(SHOPPING_LIST_OBJECT_TYPE);

    useEffect(() => {
        const unsubscribe = syncData();
        return () => unsubscribe && unsubscribe();
    }, [syncData]);

    useEffect(() => {
        setItems(data.map(item => convertFirebaseObject<FirebaseShoppingListItem, ShoppingListItem>(item)))
    }, [data]);

    const handleDeleteItem = async (itemId: string) => {
        // Optimistically remove the item from the UI
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
        try {
            await deleteData(itemId);
        } catch (error) {
            console.error("Error removing item from shopping list:", error);
            // If the delete fails, we might want to add the item back to the list
            // For now, we'll just log the error.
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemName.trim() === "") return;

        try {
            await createData({ 
                name: newItemName, 
                quantity: Number(newItemQuantity),
                unit: newItemUnit,
                createdDate: new Date()
            });
            setNewItemName(""); // Clear input after adding
            setNewItemQuantity(1);
            setNewItemUnit('unit');
        } catch (error) {
            console.error("Error adding item to shopping list:", error);
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end mb-6">
                    <div className="space-y-2">
                        <Label htmlFor="itemName">Item Name</Label>
                        <Input id="itemName" type="text" placeholder="e.g. Milk" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="itemQuantity">Quantity</Label>
                        <Input id="itemQuantity" type="number" placeholder="e.g. 1" value={newItemQuantity} onChange={(e) => setNewItemQuantity(e.target.value)} min="0" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="itemUnit">Unit</Label>
                        <Select value={newItemUnit} onValueChange={(value) => setNewItemUnit(value as UnitExtended)}>
                            <SelectTrigger id="itemUnit" className="mb-0">
                                <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {getUnits(true).map(option => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full sm:w-auto">Add Item</Button>
                </form>
                <div className="space-y-4 border-t pt-6">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                            <Checkbox id={item.id} onCheckedChange={() => handleDeleteItem(item.id)} />
                            <Label htmlFor={item.id} className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {item.name}
                                <span className="text-sm font-normal text-muted-foreground ml-2">
                                    ({item.quantity} {item.unit})
                                </span>
                            </Label>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} aria-label={`Delete ${item.name}`}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
