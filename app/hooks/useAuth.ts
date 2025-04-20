import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Here you would typically check for an existing session
    // For now, we'll just simulate a logged-in user
    const mockUser: User = {
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
    };
    
    setUser(mockUser);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Implement actual sign in logic here
    console.log('Sign in:', email, password);
  };

  const signOut = async () => {
    // Implement actual sign out logic here
    setUser(null);
  };

  return {
    user,
    loading,
    signIn,
    signOut,
  };
} 