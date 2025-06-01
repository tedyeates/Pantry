import { useEffect, useState } from 'react';
import './App.css'
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { auth } from './utils/firebase';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Pantry from './lib/pages/Pantry';
import Recipes from './lib/pages/Recipes';

// TODO: Add non anonymous auth
const initialAuthToken = null
function App() {
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    
    useEffect(() => {
        const initializeFirebase = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error: any) {
                console.error("Error signing in:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                // If no user, and we haven't tried signing in with custom token, try anonymous
                if (!initialAuthToken) {
                    setUserId(crypto.randomUUID()); // Fallback for anonymous users if no token
                }
            }
            setIsAuthReady(true); // Auth state is ready
        });

        if (!isAuthReady) { // Only initialize if not already ready
            initializeFirebase();
        }

        return () => unsubscribe();
    }, [isAuthReady]); // Depend on isAuthReady to ensure it runs once after initial check
    
    return (
        <main className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
            {/* Tabs Component */}
            <Tabs defaultValue="pantry" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="pantry">Pantry</TabsTrigger>
                    <TabsTrigger value="recipes">Recipe Book</TabsTrigger>
                </TabsList>
                <TabsContent value="pantry">
                    <Pantry />
                </TabsContent>
                <TabsContent value="recipes">
                    <Recipes />
                </TabsContent>
            </Tabs>
        </main>
    )
}

export default App
