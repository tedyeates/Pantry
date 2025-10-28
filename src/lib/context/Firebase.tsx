import { type Unsubscribe } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { createContext, useContext, useState } from "react";
import { db } from "../../utils/firebase";

type FirestoreContextValue<T> = { 
    data: T[],
    createData: (data: Omit<T, 'id'>, objectType: string) => Promise<void>,
    createMultipleData: (data: Omit<T, 'id'>[], objectType: string) => Promise<void>,
    updateData: (data: Omit<T, 'id'>, objectType: string, id?: string,) => void,
    upsertData: (data: Omit<T, 'id'>, objectType: string, id?: string,) => void,
    deleteData: (objectType: string, id?: string) => void,
    getData: (objectType: string) => Unsubscribe | void,
    getDataById: (objectType: string, id: string) => Promise<T | null | undefined>,
};

const FirestoreContext = createContext<FirestoreContextValue<unknown>>({
    data: [],
    createData: async () => {},
    createMultipleData: async () => {},
    updateData: () => {},
    upsertData: () => {},
    deleteData: () => {},
    getData: () => {},
    getDataById: async () => null,
})

const appId = import.meta.env.VITE_FIREBASE_APP_NAME;

type FirestoreProviderProps = {
    userId: string 
    children: React.ReactNode,
};

function FirestoreProvider<T>({ userId, children }: FirestoreProviderProps) {
    const [data, setData] = useState<T[]>([] as T[]);

    function getData(objectType: string) {
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

        return unsubscribe;
    }

    async function getDataById(objectType: string, id: string) {
        if (!userId) return;

        const docRef = doc(db, `artifacts/${appId}/users/${userId}/${objectType}`, id);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
            return docSnapshot.data() as T;
        } else {
            console.log("No such document!");
            return null;
        }

    }

    async function createData(data: Omit<T, 'id'>, objectType: string) {
        if (!userId) return;

        const collectionRef = collection(
            db, 
            `artifacts/${appId}/users/${userId}/${objectType}`
        );

        await addDoc(collectionRef, {
            ...data,
            createdAt: new Date(),
        });
    }

    async function createMultipleData(data: Omit<T, 'id'>[], objectType: string) {
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

    async function updateData(data: Omit<T, 'id'>, objectType: string, id?: string) {
        if (!id || !userId) return;

        const docRef = doc(db, `artifacts/${appId}/users/${userId}/${objectType}`, id);
        await updateDoc(docRef, {
            ...data,
        });
    }

    async function upsertData(data: Omit<T, 'id'>, objectType: string, id?: string) {
        if (!id || !userId) return;

        const docRef = doc(db, `artifacts/${appId}/users/${userId}/${objectType}`, id);
        await setDoc(docRef, {
            ...data
        }, { merge: true });
    }

    async function deleteData(objectType: string, id?: string) {
        if (!id || !userId) return;

        const docRef = doc(db, `artifacts/${appId}/users/${userId}/${objectType}`, id);
        await deleteDoc(docRef);
    }

    const contextValue: FirestoreContextValue<T> = { 
        data, 
        createData, 
        createMultipleData,
        updateData,
        upsertData,
        deleteData,
        getData,
        getDataById,
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
