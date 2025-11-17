'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeamState] = useState<TeamSelection>({ type: 'all' });
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved selection from localStorage after hydration
  useEffect(() => {
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

  // Load teams on mount
  useEffect(() => {
    async function loadTeams() {
      try {
        console.log('TeamContext: Loading teams...');
        const response = await fetch('/api/teams');
        if (response.ok) {
          const data = await response.json();
          const loadedTeams = data.teams || [];
          console.log('TeamContext: Loaded teams:', loadedTeams.map(t => ({ id: t.id, name: t.name })));
          setTeams(loadedTeams);

          // Validate selected team after teams are loaded
          setSelectedTeamState(prev => {
            console.log('TeamContext: Validating selection:', prev);
            // If a team is selected but doesn't exist anymore, reset to 'all'
            if (prev.type === 'single' && prev.teamId) {
              const teamExists = loadedTeams.some(t => t.id === prev.teamId);
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
            console.log('TeamContext: Selection validated:', prev);
            return prev;
          });
        } else {
          console.error('TeamContext: Failed to load teams, status:', response.status);
        }
      } catch (error) {
        console.error('Failed to load teams:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTeams();
  }, []);

  const setSelectedTeam = (selection: TeamSelection) => {
    console.log('TeamContext: Setting selected team:', selection);
    setSelectedTeamState(selection);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
        console.log('TeamContext: Saved selection to localStorage');
      } catch (error) {
        console.error('Failed to save team selection:', error);
      }
    }
  };

  return (
    <TeamContext.Provider
      value={{
        selectedTeam,
        setSelectedTeam,
        teams,
        setTeams,
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
