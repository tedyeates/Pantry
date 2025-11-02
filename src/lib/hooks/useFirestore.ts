import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    setDoc,
    updateDoc,
    writeBatch,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from "../../utils/firebase";
import { useAuth } from '../context/Auth';

const appId = import.meta.env.VITE_FIREBASE_APP_NAME;

export function useFirestore<T, U extends { id: string }>(objectType: string) {
    const { userId } = useAuth();
    const [data, setData] = useState<U[]>([]);

    const syncData = useCallback(() => {
        if (!userId) {
            setData([]);
            return;
        }

        const collectionRef = collection(
            db,
            `artifacts/${appId}/users/${userId}/${objectType}`
        );
        const unsubscribe = onSnapshot(collectionRef, 
            (snapshot) => {
                const data = snapshot.docs.map((doc) =>({
                    id: doc.id,
                    ...doc.data(),
                } as U));
                setData(data);
            },
            (error) => {
                console.error(`Error fetching ${objectType}:`, error);
                setData([]);
            }
        );

        return unsubscribe;
    }, [userId, objectType]);

    async function getDataById(id: string) {
        if (!userId) return null;

        const docRef = doc(db, `artifacts/${appId}/users/${userId}/${objectType}`, id);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
            return { id: docSnapshot.id, ...docSnapshot.data() } as U;
        } else {
            console.log("No such document!");
            return null;
        }
    }

    async function createData(data: T) {
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

    async function createMultipleData(data: T[]) {
        if (!userId || data.length === 0) return;

        const batch = writeBatch(db);
        const collectionRef = collection(
            db,
            `artifacts/${appId}/users/${userId}/${objectType}`
        );

        data.forEach((item) => {
        const docRef = doc(collectionRef); // Automatically generate a new document ID
        batch.set(docRef, {
            ...item,
            createdDate: new Date(),
        });
        });
        await batch.commit();
    }

    async function updateData(id: string, data: Partial<T>) {
        if (!userId) return;

        const docRef = doc(db, `artifacts/${appId}/users/${userId}/${objectType}`, id);
        await updateDoc(docRef, data);
    }

    async function upsertData(id: string, data: Partial<T>) {
        if (!userId) return;

        const docRef = doc(db, `artifacts/${appId}/users/${userId}/${objectType}`, id);
        await setDoc(docRef, data, { merge: true });
    }

    async function deleteData(id: string) {
        if (!userId) return;

        const docRef = doc(db, `artifacts/${appId}/users/${userId}/${objectType}`, id);
        await deleteDoc(docRef);
    }

    
    return {
        data,
        createData,
        createMultipleData,
        updateData,
        upsertData,
        deleteData,
        getDataById,
        syncData,
    };
}
