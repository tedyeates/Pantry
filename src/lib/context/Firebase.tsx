import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc, writeBatch } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../utils/firebase";
import type { ObjectType } from "@/lib/schemas/schema";

type FirestoreContextValue<T> = { 
    userId: string | null,
    isAuthReady: boolean,
    data: T[],
    createData: (data: Omit<T, 'id'>) => Promise<void>,
    createMultipleData: (data: Omit<T, 'id'>[]) => Promise<void>,
    updateData: (data: Omit<T, 'id'>, id?: string) => void
    deleteData: (id?: string) => void
};

const FirestoreContext = createContext<FirestoreContextValue<unknown>>({
    userId: null,
    isAuthReady: false,
    data: [],
    createData: async () => {},
    createMultipleData: async () => {},
    updateData: () => {},
    deleteData: () => {},
})

const initialAuthToken = null
const appId = import.meta.env.VITE_FIREBASE_APP_NAME;

type FirestoreProviderProps = { 
    children: React.ReactNode, 
    objectType: ObjectType 
};

function FirestoreProvider<T>({ children, objectType }: FirestoreProviderProps) {
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    const [data, setData] = useState<T[]>([] as T[]);

    useEffect(() => {
        const initializeFirebase = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error: unknown) {
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

    useEffect(() => {
        if (!userId) return;
        
        const collectionRef = collection(db, `artifacts/${appId}/users/${userId}/${objectType}`);
        const unsubscribe = onSnapshot(collectionRef,(snapshot) => {
            const data: T[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data() as Omit<T, 'id'>,
            }) as T);
            setData(data);
        }, (error) => {
            console.error("Error fetching items:", error);
        })

        return () => unsubscribe();
    }, [userId, objectType])


    async function createData(data: Omit<T, 'id'>) {
        if (!userId) return;

        const collectionRef = collection(db, `artifacts/${appId}/users/${userId}/${objectType}`);
        await addDoc(collectionRef, {
            ...data,
            createdAt: new Date(),
        });
    }

    async function createMultipleData(data: Omit<T, 'id'>[]) {
        if (!userId || data.length === 0) return;

        const batch = writeBatch(db);
        const collectionRef = collection(db, `artifacts/${appId}/users/${userId}/${objectType}`);

        data.forEach((item) => {
            const docRef = doc(collectionRef); // Automatically generate a new document ID
            batch.set(docRef, {
                ...item,
                createdDate: new Date(),
            });
        });
        await batch.commit();
    }
    async function updateData(data: Omit<T, 'id'>, id?: string) {
        if (!id || !userId) return;

        const docRef = doc(db, `artifacts/${appId}/users/${userId}/${objectType}`, id);
        await updateDoc(docRef, {
            ...data,
        });
    }

    async function deleteData(id?: string) {
        if (!id || !userId) return;

        const docRef = doc(db, `artifacts/${appId}/users/${userId}/${objectType}`, id);
        await deleteDoc(docRef);
    }

    const contextValue: FirestoreContextValue<T> = { 
        userId, 
        isAuthReady, 
        data, 
        createData, 
        createMultipleData,
        updateData,
        deleteData
    };

    return (
        <FirestoreContext.Provider value={contextValue as FirestoreContextValue<unknown>}>
            {children}
        </FirestoreContext.Provider>
    );
}

function useFirestore<T>(): FirestoreContextValue<T> {
    const context = useContext(FirestoreContext);

    if (context === null) {
        throw new Error('useFirestore must be used within a DataProvider');
    }

    return context as FirestoreContextValue<T>;
}

export { FirestoreProvider, useFirestore }
