import './App.css'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Pantry from './lib/pages/Pantry';
import Recipe from './lib/pages/Recipe'; 
import BarcodeScanner from './lib/pages/BarcodeScanner';
import Login from './lib/pages/Login';
import { Button } from './components/ui/button';
import { AuthProvider, useAuth } from './lib/context/Auth';
import Location from './lib/pages/Location';
import Shop from './lib/pages/Shop';
import IngredientType from './lib/pages/IngredientType';
import IngredientList from './lib/pages/IngredientList';
import Alias from './lib/pages/Alias';

function AppContent() {
    const { user, isAuthReady, signOut } = useAuth();

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
                <TabsList className="grid w-full grid-cols-8 mb-6">
                    <TabsTrigger value="pantry">🍞Pantry</TabsTrigger>
                    <TabsTrigger value="recipes">🔪Recipes</TabsTrigger>
                    <TabsTrigger value="shopping-list">🛒Shopping List</TabsTrigger>
                    <TabsTrigger value="barcode">Scanner</TabsTrigger>
                    <TabsTrigger value="location">Locations</TabsTrigger>
                    <TabsTrigger value="ingredient-type">Ingredient Types</TabsTrigger>
                    <TabsTrigger value="shop">Shops</TabsTrigger>
                    <TabsTrigger value="alias">Alias</TabsTrigger>
                </TabsList>
                <TabsContent value="pantry"><Pantry /></TabsContent>
                <TabsContent value="recipes"><Recipe /></TabsContent>
                <TabsContent value="barcode"><BarcodeScanner /></TabsContent>
                <TabsContent value="shopping-list"><IngredientList /></TabsContent>
                <TabsContent value="location"><Location /></TabsContent>
                <TabsContent value="ingredient-type"><IngredientType /></TabsContent>
                <TabsContent value="shop"><Shop /></TabsContent>
                <TabsContent value="alias"><Alias /></TabsContent>
            </Tabs>
        </main>
    )
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}

export default App
