"use client";

import { useRef, useState, useEffect } from "react";
import type { Result } from "@zxing/library";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { FormFieldExtended, PantryIngredient, SupportedObjects, UnitExtended } from "@/lib/schemas/schema";
import { getOpenFoodFactsProduct } from "@/utils/foodfacts";
import { useFirestore } from "../context/Firebase";
import { Trash2, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import Field from "../components/fields/Field";
import { convertUnit } from "@/utils/quantity";
import { creatFields } from "@/utils/fieldData";


export default function BarcodeScanner() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanning, setScanning] = useState(false);
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
    const [scannedItems, setScannedItems] = useState<Omit<PantryIngredient, 'id'>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { createMultipleData } = useFirestore<PantryIngredient>();

    // Effect to clean up the camera stream when the component unmounts
    useEffect(() => {
        return () => {
            stopScan();
        };
    }, []);

    const handleScanResult = async (result: Result | undefined | null) => {
        if (result) {
            stopScan(); // Stop camera after a successful scan
            setIsLoading(true);
            const barcode = result.getText();
            const productResult = await getOpenFoodFactsProduct(barcode);
            console.log(barcode)
            console.log(productResult)
            if (productResult.data) {
                setScannedItems(prevItems => [...prevItems, productResult.data!]);
            } 

            if (!productResult.success) {
                console.error("Product not found or error fetching data for barcode:", barcode);
            }
            
            setIsLoading(false);
        }
    };

    const startScan = () => {
        if (!videoRef.current) return;

        const codeReader = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReader;
        
        // Ask for permission and start scanning
        codeReader.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
            handleScanResult(result);
            if (error && !(error instanceof NotFoundException)) {
                console.error(error);
            }
        }).catch(err => console.error(err));

        setScanning(true);
    };

    const stopScan = () => {
        if (codeReaderRef.current) {
            codeReaderRef.current.reset();
            codeReaderRef.current = null;
        }
        setScanning(false);
    };

    const handleRemoveItem = (index: number) => {
        setScannedItems(prevItems => prevItems.filter((_, i) => i !== index));
    };

    const getScannedItem = (
        items: Omit<PantryIngredient, 'id'>[],
        index: number,
        fieldName: string,
        value: string | number | SupportedObjects[],
    ) => {
        return items.map(
            (item, i) => i === index ? {
                ...item,
                [fieldName]: value  
            } : item
        )
    }

    const handleInputChange = (
        index: number, 
        field: FormFieldExtended, 
        value: string
    ) => {
        const fieldValue = field.type === 'number' ? parseFloat(value) : value
        const newItems = getScannedItem(scannedItems, index, field.name, fieldValue)
        setScannedItems(newItems)
    };

    const handleUnitChange = (
        quantity: number, 
        oldUnit: UnitExtended, 
        newUnit: UnitExtended,
        field: FormFieldExtended,
        index: number
    ) => {
        const unitFieldName = field.extraFields?.[0].name
        if (!unitFieldName) return

        const {val, unit} = convertUnit(quantity, oldUnit, newUnit)

        let newItems = getScannedItem(scannedItems, index, field.name, val)
        newItems = getScannedItem(newItems, index, unitFieldName, unit)

        setScannedItems(newItems)
    }

    const handleSelectChange = (
        index: number,
        fieldName: string,
        value: string | SupportedObjects[]
    ) => {
        const newItems = getScannedItem(scannedItems, index, fieldName, value)
        setScannedItems(newItems)
    }

    const handleSaveAll = async () => {
        setIsLoading(true);
        try {
            await createMultipleData(scannedItems);
            setScannedItems([]); 
        } catch (error) {
            console.error("Error saving items to Firebase:", error);
        }
        setIsLoading(false);
    };

    return (
        <div>
            <div className="mb-4">
                {!scanning ? (
                    <Button onClick={startScan}>Start Camera Scan</Button>
                ) : (
                    <Button variant="destructive" onClick={stopScan}>Stop Camera</Button>
                )}
            </div>

            {/* Video feed will only be visible when scanning */}
            <video ref={videoRef} className={`w-full rounded-lg border border-gray-200 ${!scanning && 'hidden'}`} />

            {isLoading && <p>Loading...</p>}

            <div className="space-y-4 mt-4">
                {scannedItems.map((item, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                <Trash2 className="h-5 w-5 text-red-500" />
                            </Button>
                        </CardHeader>
                        <CardContent className="grid gap-2 sm:grid-cols-2">
                            {creatFields.map((field) => (
                                <div key={field.name} className="space-y-2">
                                <Label htmlFor={field.name}>{field.label}</Label>
                                <Field<PantryIngredient>
                                    field={field}
                                    formData={item}
                                    handleInputChange={(event) => handleInputChange(
                                        index, 
                                        field,
                                        event.target.value
                                    )}
                                    handleUnitChange={(fieldName, value) => handleUnitChange(
                                        scannedItems[index][field.name as keyof PantryIngredient] as number, 
                                        scannedItems[index][fieldName as keyof PantryIngredient] as UnitExtended, 
                                        value as UnitExtended,
                                        field,
                                        index
                                    )}
                                    handleSelectChange={(fieldName, value) => handleSelectChange(index, fieldName, value)}
                                    handleArrayOfObjectsChange={(newValues) => {
                                        handleSelectChange(index, field.name, newValues)
                                    }}
                                />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {scannedItems.length > 0 && (
                <div className="flex justify-end mt-6">
                    <Button onClick={handleSaveAll} disabled={isLoading}>
                        <Save className="mr-2 h-4 w-4" /> Save All to Pantry
                    </Button>
                </div>
            )}
        </div>
    );
}
