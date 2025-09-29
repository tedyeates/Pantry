import './App.css'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Pantry from './lib/pages/Pantry';
import Recipes from './lib/pages/Recipes';
import { FirestoreProvider } from './lib/context/Firebase';
import type { BarcodeIngredient, Ingredient, Recipe } from './lib/schemas/schema';
import BarcodeScanner from './lib/pages/BarcodeScanner';

// TODO: Add non anonymous auth
function App() {
    
    return (
        <main className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl my-4">
                <Tabs defaultValue="pantry" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="pantry">Pantry</TabsTrigger>
                        <TabsTrigger value="recipes">Recipe Book</TabsTrigger>
                        <TabsTrigger value="barcode">Barcode Scanner</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pantry">
                        <FirestoreProvider<Ingredient>>
                            <Pantry />
                        </FirestoreProvider>
                    </TabsContent>
                    <TabsContent value="recipes">
                        <FirestoreProvider<Recipe>>
                            <Recipes />
                        </FirestoreProvider>
                    </TabsContent>
                    <TabsContent value="barcode">
                        <FirestoreProvider<Ingredient | BarcodeIngredient>>
                            <BarcodeScanner />
                        </FirestoreProvider>
                    </TabsContent>
                </Tabs>
        </main>
    )
}

export default App
