'use client';

import { useState, useEffect } from 'react';
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

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        withCredentials: true, // Ensure cookies are sent
      });
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null); // Clear user on error
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, refetch: fetchUser };
}

