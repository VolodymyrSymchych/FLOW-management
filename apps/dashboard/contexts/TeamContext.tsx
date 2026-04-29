'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { useBootstrap } from '@/hooks/useQueries';

export interface Team {
  id: number;
  name: string;
  description?: string | null;
  ownerId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TeamSelection = {
  type: 'all' | 'single';
  teamId?: number;
};

type TeamContextType = {
  selectedTeam: TeamSelection;
  setSelectedTeam: (selection: TeamSelection) => void;
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  isLoading: boolean;
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const STORAGE_KEY = 'selected-team';

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeamState] = useState<TeamSelection>({ type: 'all' });
  const [isHydrated, setIsHydrated] = useState(false);
  const queryClient = useQueryClient();
  const bootstrapTeamId = selectedTeam.type === 'all' ? 'all' : selectedTeam.teamId;
  const {
    data: bootstrapData,
    isLoading: teamsLoading,
    isFetched: teamsFetched,
  } = useBootstrap(bootstrapTeamId, !!user && !userLoading && isHydrated);
  const teams = bootstrapData?.teams || [];

  // Load saved selection from localStorage after hydration
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setIsHydrated(true);
      return;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSelectedTeamState(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to parse saved team selection:', error);
    }
    setIsHydrated(true);
  }, []);

  // Validate selected team and set isLoading = false ONLY when both hydration and teams are loaded
  useEffect(() => {
    const teamsReady = !user || teamsFetched || (!userLoading && !teamsLoading);

    if (!isHydrated || !teamsReady) {
      return; // Wait for both
    }

    // Validate selected team after both localStorage and teams are loaded
    setSelectedTeamState(prev => {
      // If a team is selected but doesn't exist anymore, reset to 'all'
      if (prev.type === 'single' && prev.teamId) {
        const teamExists = teams.some(t => t.id === prev.teamId);
        if (!teamExists) {
          console.warn(`TeamContext: Selected team ${prev.teamId} not found, resetting to 'all'`);
          // Clear invalid selection from localStorage
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (e) {
            console.error('Failed to clear invalid team selection:', e);
          }
          return { type: 'all' };
        }
      }
      return prev;
    });

    // Now we can safely set loading to false
    setIsLoading(false);
  }, [isHydrated, teamsFetched, teamsLoading, user, userLoading, teams]);

  const setSelectedTeam = (selection: TeamSelection) => {
    setSelectedTeamState(selection);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
      } catch (error) {
        console.error('Failed to save team selection:', error);
      }
    }
    
    // Invalidate queries to force data reload across the app for the new team without a full page refresh
    if (queryClient) {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  };

  return (
    <TeamContext.Provider
      value={{
        selectedTeam,
        setSelectedTeam,
        teams,
        setTeams: (nextTeams: Team[]) => queryClient.setQueryData(['teams'], nextTeams),
        isLoading
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within TeamProvider');
  }
  return context;
}
