import './App.css'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Pantry from './lib/pages/Pantry';
import Recipes from './lib/pages/Recipes';
import { FirestoreProvider } from './lib/context/Firebase';
import type { Ingredient, Recipe } from './utils/schema';

// TODO: Add non anonymous auth
function App() {
    
    return (
        <main className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl my-4">
                <Tabs defaultValue="pantry" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="pantry">Pantry</TabsTrigger>
                        <TabsTrigger value="recipes">Recipe Book</TabsTrigger>
                    </TabsList>
                    <FirestoreProvider<Ingredient> objectType="pantry">
                        <TabsContent value="pantry">
                            <Pantry />
                        </TabsContent>
                    </FirestoreProvider>
                    <FirestoreProvider<Recipe> objectType="recipe">
                        <TabsContent value="recipes">
                            <Recipes />
                        </TabsContent>
                    </FirestoreProvider>
                </Tabs>
        </main>
    )
}

export default App
