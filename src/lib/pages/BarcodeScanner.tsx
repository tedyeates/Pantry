"use client";

import { useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function BarcodeScanner() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState("");
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

    const startScan = () => {
        if (!videoRef.current) return;

        const codeReader = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReader;
        setScanning(true);

        codeReader.decodeFromVideoDevice(null, videoRef.current, (res) => {
            if (res) {
                setResult(res.getText());
                stopScan(); // Stop camera after successful scan
            }
        });
    };

    const stopScan = () => {
        codeReaderRef.current?.reset();
        setScanning(false);
    };

    return (
        <div className="flex justify-center p-6">
            <Card className="w-full max-w-md shadow-lg rounded-2xl">
                <CardHeader>
                    <h1 className="text-xl font-semibold">📷 Barcode Scanner</h1>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <video
                        ref={videoRef}
                        className="w-full rounded-lg border border-gray-200"
                    />
                    {scanning ? (
                        <>
                            <p className="text-sm text-muted-foreground">
                                Point your camera at a barcode…
                            </p>
                            <Button variant="destructive" onClick={stopScan}>
                                Stop
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={startScan}>Start Scan</Button>
                            {result && (
                                <div className="w-full bg-muted p-3 rounded-md text-center">
                                    <p className="font-mono text-lg">{result}</p>
                                    <Button
                                        onClick={startScan}
                                        className="mt-3"
                                        variant="secondary"
                                    >
                                        Scan Again
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
