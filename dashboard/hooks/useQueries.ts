import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Project, type Stats } from '@/lib/api';
import axios from 'axios';

// Dashboard Stats Query
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    staleTime: 2 * 60 * 1000, // 2 хвилини - stats змінюються часто
    gcTime: 10 * 60 * 1000,
  });
}

// Projects Query with team filtering
export function useProjects(teamId?: number | string) {
  return useQuery({
    queryKey: ['projects', teamId || 'all'],
    queryFn: async () => {
      // Конвертуємо teamId до правильного типу
      const normalizedTeamId = teamId === 'all' || !teamId 
        ? 'all' 
        : typeof teamId === 'string' 
          ? parseInt(teamId, 10) 
          : teamId;
      const result = await api.getProjects(normalizedTeamId);
      return result.projects || [];
    },
    staleTime: 5 * 60 * 1000, // 5 хвилин
    gcTime: 15 * 60 * 1000,
  });
}

// Single Project Query
export function useProject(projectId: number) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.getProject(projectId),
    staleTime: 3 * 60 * 1000,
    enabled: !!projectId,
  });
}

// Tasks Query with team filtering
export function useTasks(teamId?: number | string) {
  return useQuery({
    queryKey: ['tasks', teamId || 'all'],
    queryFn: async () => {
      const url = teamId && teamId !== 'all'
        ? `/api/tasks?team_id=${teamId}`
        : '/api/tasks';
      const response = await axios.get(url);
      return response.data.tasks || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Invoices Query
export function useInvoices(teamId?: number | string) {
  return useQuery({
    queryKey: ['invoices', teamId || 'all'],
    queryFn: async () => {
      const url = teamId && teamId !== 'all'
        ? `/api/invoices?team_id=${teamId}`
        : '/api/invoices';
      const response = await axios.get(url);
      return response.data.invoices || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Team Members Query
export function useTeamMembers(teamId: number) {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const response = await axios.get(`/api/teams/${teamId}/members?include_attendance=true`);
      return response.data.members || [];
    },
    staleTime: 3 * 60 * 1000,
    enabled: !!teamId,
  });
}

// Teams Query
export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await axios.get('/api/teams');
      return response.data.teams || [];
    },
    staleTime: 10 * 60 * 1000, // Teams не змінюються часто
  });
}

// Chat Messages Query
export function useChatMessages(chatId: number) {
  return useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/messages/chat/${chatId}`);
      const data = await response.json();
      return data.messages || [];
    },
    staleTime: 30 * 1000, // 30 секунд для реального часу
    enabled: !!chatId,
  });
}

// Chat Members Query
export function useChatMembers(chatId: number) {
  return useQuery({
    queryKey: ['chat-members', chatId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/chats/${chatId}/members`);
      const data = await response.json();
      return data.members || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!chatId,
  });
}

// Prefetch helper для швидкого переходу між сторінками
export function usePrefetch() {
  const queryClient = useQueryClient();

  return {
    prefetchProjects: (teamId?: number | string) => {
      queryClient.prefetchQuery({
        queryKey: ['projects', teamId || 'all'],
        queryFn: async () => {
          // Конвертуємо teamId до правильного типу
          const normalizedTeamId = teamId === 'all' || !teamId 
            ? 'all' 
            : typeof teamId === 'string' 
              ? parseInt(teamId, 10) 
              : teamId;
          const result = await api.getProjects(normalizedTeamId);
          return result.projects || [];
        },
      });
    },
    prefetchTasks: (teamId?: number | string) => {
      queryClient.prefetchQuery({
        queryKey: ['tasks', teamId || 'all'],
        queryFn: async () => {
          const url = teamId && teamId !== 'all'
            ? `/api/tasks?team_id=${teamId}`
            : '/api/tasks';
          const response = await axios.get(url);
          return response.data.tasks || [];
        },
      });
    },
    prefetchStats: () => {
      queryClient.prefetchQuery({
        queryKey: ['stats'],
        queryFn: api.getStats,
      });
    },
  };
}

