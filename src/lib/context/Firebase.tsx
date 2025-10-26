import { GoogleAuthProvider, type User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut as firebaseSignOut, type Unsubscribe } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../utils/firebase";

type FirestoreContextValue<T> = { 
    userId: string | null,
    isAuthReady: boolean,
    data: T[],
    createData: (data: Omit<T, 'id'>, objectType: string) => Promise<void>,
    createMultipleData: (data: Omit<T, 'id'>[], objectType: string) => Promise<void>,
    signInWithGoogle: () => Promise<void>,
    signInWithEmail: (email: string, password: string) => Promise<void>,
    signUpWithEmail: (email: string, password: string) => Promise<void>,
    signOut: () => Promise<void>,
    updateData: (data: Omit<T, 'id'>, objectType: string, id?: string,) => void,
    upsertData: (data: Omit<T, 'id'>, objectType: string, id?: string,) => void,
    deleteData: (objectType: string, id?: string) => void,
    getData: (objectType: string) => Unsubscribe | void,
    getDataById: (objectType: string, id: string) => Promise<T | null | undefined>,
    user: User | null
};

const FirestoreContext = createContext<FirestoreContextValue<unknown>>({
    userId: null,
    isAuthReady: false,
    data: [],
    createData: async () => {},
    createMultipleData: async () => {},
    signInWithGoogle: async () => {},
    signInWithEmail: async () => {},
    signUpWithEmail: async () => {},
    signOut: async () => {},
    updateData: () => {},
    upsertData: () => {},
    deleteData: () => {},
    getData: () => {},
    getDataById: async () => null,
    user: null
})

const appId = import.meta.env.VITE_FIREBASE_APP_NAME;

type FirestoreProviderProps = { 
    children: React.ReactNode,
};

function FirestoreProvider<T>({ children }: FirestoreProviderProps) {
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    const [data, setData] = useState<T[]>([] as T[]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is authenticated with Firebase, now check if they are authorized.
                const userDocRef = doc(db, 'allowed_users', user.email!);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    // User is authorized, set user state.
                    setUser(user);
                    setUserId(user.uid);
                } else {
                    // User is not authorized, sign them out immediately.
                    console.error(`Unauthorized user signed in: ${user.email}. Signing out.`);
                    await firebaseSignOut(auth);
                    setUser(null);
                    setUserId(null);
                }
            } else {
                // User is signed out.
                setUser(null);
                setUserId(null);
            }
            setIsAuthReady(true); // Auth state is ready
        });

        return () => unsubscribe();
    }, []);

    const googleProvider = new GoogleAuthProvider();
    const signInWithGoogle = async () => {
        try {
            // The onAuthStateChanged observer will handle the authorization check.
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Sign-in failed:", error);
            throw error;
        }
    };
    const signInWithEmail = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password).then(() => {});
    const signUpWithEmail = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password).then(() => {});
    const signOut = () => firebaseSignOut(auth);

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
        userId, 
        isAuthReady, 
        data, 
        createData, 
        createMultipleData,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateData,
        upsertData,
        deleteData,
        getData,
        getDataById,
        user
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
