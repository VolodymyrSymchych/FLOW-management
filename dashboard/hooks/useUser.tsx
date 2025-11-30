'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import axios from 'axios';

export interface User {
  id: number;
  email: string;
  username: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  emailVerified: boolean;
  role: string;
}

interface UserContextValue {
  user: User | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ 
  children, 
  initialUser 
}: { 
  children: ReactNode; 
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState(!initialUser); // Don't load if we have initial data
  
  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        withCredentials: true,
      });
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Only fetch if we don't have initial data
    if (!initialUser) {
      fetchUser();
    }
  }, []); // Run only once on mount
  
  return (
    <UserContext.Provider value={{ user, loading, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

