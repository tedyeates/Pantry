import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuthError } from "firebase/auth";
import { useState } from "react";
import { useAuth } from "../context/Auth";

export function Login() {
    const { signInWithGoogle } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAuthError = (err: AuthError | Error) => {
        // Handle our custom authorization error first
        if (err.message === "This account is not authorized to access the application.") {
            setError(err.message);
            return;
        }
        switch ((err as AuthError).code) {
            case 'auth/invalid-email':
                setError('Please enter a valid email address.');
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                setError('Invalid email or password.');
                break;
            case 'auth/email-already-in-use':
                setError('An account with this email already exists.');
                break;
            case 'auth/weak-password':
                setError('Password should be at least 6 characters.');
                break;
            default:
                setError('An unexpected error occurred. Please try again.');
                console.error(err);
        }
    }

    const handleGoogleSignIn = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await signInWithGoogle();
        } catch (err) { handleAuthError(err as Error) }
        setIsLoading(false);
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Pantry Login</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex flex-col gap-2">
                        <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={isLoading}>{isLoading ? 'Signing In with Google...' : 'Sign In with Google'}</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default Login;