import './App.css'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Pantry from './lib/pages/Pantry';
import Recipes from './lib/pages/Recipes';
import { FirestoreProvider, useFirestore } from './lib/context/Firebase';
import type { BarcodeIngredient, Ingredient, Recipe } from './lib/schemas/schema';
import BarcodeScanner from './lib/pages/BarcodeScanner';
import Login from './lib/pages/Login';
import { Button } from './components/ui/button';

function AppContent() {
    const { user, isAuthReady, signOut } = useFirestore();

    if (!isAuthReady) {
        return <><div>Loading...</div><Button variant="outline" onClick={signOut}>Sign Out</Button></>; // Or a proper loading spinner
    }

    if (!user) {
        return <Login />;
    }

    return (
        <main className="bg-white p-6 sm:p-8 sm:max-w-4xl sm:mx-auto sm:rounded-xl sm:shadow-2xl sm:my-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Welcome, {user.displayName || 'User'}!</h1>
                <Button variant="outline" onClick={signOut}>Sign Out</Button>
            </div>
            <Tabs defaultValue="pantry" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="pantry">Pantry</TabsTrigger>
                    <TabsTrigger value="recipes">Recipe Book</TabsTrigger>
                    <TabsTrigger value="barcode">Barcode Scanner</TabsTrigger>
                </TabsList>
                <TabsContent value="pantry"><Pantry /></TabsContent>
                <TabsContent value="recipes"><Recipes /></TabsContent>
                <TabsContent value="barcode"><BarcodeScanner /></TabsContent>
            </Tabs>
        </main>
    )
}

function App() {
    return (
        <FirestoreProvider<Ingredient | Recipe | BarcodeIngredient>>
            <AppContent />
        </FirestoreProvider>
    )
}

export default App
