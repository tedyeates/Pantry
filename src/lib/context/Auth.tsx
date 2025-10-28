import { GoogleAuthProvider, type User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc} from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../utils/firebase";

type AuthContextValue = { 
    userId: string | null,
    isAuthReady: boolean,
    signInWithGoogle: () => Promise<void>,
    signInWithEmail: (email: string, password: string) => Promise<void>,
    signUpWithEmail: (email: string, password: string) => Promise<void>,
    signOut: () => Promise<void>,
    user: User | null
};

const AuthContext = createContext<AuthContextValue>({
    userId: null,
    isAuthReady: false,
    signInWithGoogle: async () => {},
    signInWithEmail: async () => {},
    signUpWithEmail: async () => {},
    signOut: async () => {},
    user: null
})

type AuthProviderProps = { 
    children: React.ReactNode,
};

function AuthProvider({ children }: AuthProviderProps) {
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

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


    const contextValue: AuthContextValue = { 
        userId, 
        isAuthReady, 
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        user
    };

    return (
        <AuthContext.Provider value={contextValue as AuthContextValue}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error('useAuth must be used within a DataProvider');
    }

    return context as AuthContextValue;
}

export { AuthProvider, useAuth }
