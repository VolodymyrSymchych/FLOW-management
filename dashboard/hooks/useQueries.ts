import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Project, type Stats } from '@/lib/api';
import axios from 'axios';

// Dashboard Stats Query
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    staleTime: 60 * 1000, // 1 хвилина - дані вважаються свіжими
    gcTime: 10 * 60 * 1000, // Зберігати в кеші 10 хвилин
    refetchInterval: 60 * 1000, // Автоматично оновлювати кожну хвилину
    refetchOnWindowFocus: true, // Оновлювати при поверненні на вкладку
    refetchOnMount: false, // Не робити зайвих запитів при монтуванні якщо дані свіжі
  });
}

// Dashboard Data Query (Redis-only, no DB fallback)
// Use this for the main dashboard page for fast loading
export function useDashboardData(teamId?: number | string) {
  return useQuery({
    queryKey: ['dashboard', teamId || 'all'],
    queryFn: async () => {
      const url = teamId && teamId !== 'all'
        ? `/api/dashboard?team_id=${teamId}`
        : '/api/dashboard';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }
      return response.json();
    },
    staleTime: 60 * 1000, // 1 хвилина
    gcTime: 10 * 60 * 1000, // Зберігати в кеші 10 хвилин
    refetchInterval: 60 * 1000, // Автоматично оновлювати кожну хвилину
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
}

// Projects Query with team filtering
export function useProjects(teamId?: number | string) {
  const queryClient = useQueryClient();

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
    staleTime: 60 * 1000, // 1 хвилина
    gcTime: 15 * 60 * 1000, // Зберігати в кеші 15 хвилин
    refetchInterval: 60 * 1000, // Автоматично оновлювати кожну хвилину
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    // Показувати попередні дані поки завантажуються нові (при зміні teamId)
    // Це запобігає показу skeleton при переключенні команд
    placeholderData: (previousData) => previousData,
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
    staleTime: 60 * 1000, // 1 хвилина
    refetchInterval: 60 * 1000, // Автоматично оновлювати кожну хвилину
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    // Показувати попередні дані поки завантажуються нові
    placeholderData: (previousData) => previousData,
  });
}

// Invoices Query - optimized for fast loading
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
    staleTime: 2 * 60 * 1000, // 2 хвилини
    gcTime: 10 * 60 * 1000, // Зберігати в кеші 10 хвилин
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
}

// Chats Query - optimized for fast loading
export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await fetch('/api/chat/chats');
      if (!response.ok) throw new Error('Failed to load chats');
      const data = await response.json();
      return data.chats || [];
    },
    staleTime: 30 * 1000, // 30 секунд - чати оновлюються часто
    gcTime: 5 * 60 * 1000, // Зберігати в кеші 5 хвилин
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
}

// Single Chat Query with messages
export function useChatWithMessages(chatId: number | null) {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      if (!chatId) return null;
      const response = await fetch(`/api/chat?chatId=${chatId}`);
      if (!response.ok) throw new Error('Failed to load chat');
      return response.json();
    },
    staleTime: 15 * 1000, // 15 секунд
    gcTime: 5 * 60 * 1000,
    enabled: !!chatId,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
}

// Team Members Query - optimized for fast loading
export function useTeamMembers(teamId: number) {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const response = await axios.get(`/api/teams/${teamId}/members?include_attendance=true`);
      const members = (response.data.members || []).filter((m: any) => m.user);
      return members;
    },
    staleTime: 2 * 60 * 1000, // 2 хвилини
    gcTime: 10 * 60 * 1000, // Зберігати в кеші 10 хвилин
    enabled: !!teamId && teamId > 0,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
}

// Teams Query - optimized for fast loading
export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await axios.get('/api/teams');
      return response.data.teams || [];
    },
    staleTime: 5 * 60 * 1000, // 5 хвилин
    gcTime: 30 * 60 * 1000, // Зберігати в кеші 30 хвилин
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
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

// Attendance/Time Entries Query
export function useAttendance(teamId?: number | string) {
  return useQuery({
    queryKey: ['attendance', teamId || 'all'],
    queryFn: async () => {
      const url = teamId && teamId !== 'all'
        ? `/api/attendance?team_id=${teamId}`
        : '/api/attendance';
      const response = await axios.get(url);
      return response.data.entries || [];
    },
    staleTime: 60 * 1000, // 1 хвилина
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
}

// Reports/Documentation Query
export function useReports(teamId?: number | string) {
  return useQuery({
    queryKey: ['reports', teamId || 'all'],
    queryFn: async () => {
      const url = teamId && teamId !== 'all'
        ? `/api/reports?team_id=${teamId}`
        : '/api/reports';
      const response = await axios.get(url);
      return response.data.reports || [];
    },
    staleTime: 5 * 60 * 1000, // 5 хвилин
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
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
    prefetchChats: () => {
      queryClient.prefetchQuery({
        queryKey: ['chats'],
        queryFn: async () => {
          const response = await fetch('/api/chat/chats');
          if (!response.ok) throw new Error('Failed to load chats');
          const data = await response.json();
          return data.chats || [];
        },
      });
    },
    prefetchInvoices: (teamId?: number | string) => {
      queryClient.prefetchQuery({
        queryKey: ['invoices', teamId || 'all'],
        queryFn: async () => {
          const url = teamId && teamId !== 'all'
            ? `/api/invoices?team_id=${teamId}`
            : '/api/invoices';
          const response = await axios.get(url);
          return response.data.invoices || [];
        },
      });
    },
    prefetchChat: (chatId: number) => {
      queryClient.prefetchQuery({
        queryKey: ['chat', chatId],
        queryFn: async () => {
          const response = await fetch(`/api/chat?chatId=${chatId}`);
          if (!response.ok) throw new Error('Failed to load chat');
          return response.json();
        },
      });
    },
    prefetchTeams: () => {
      queryClient.prefetchQuery({
        queryKey: ['teams'],
        queryFn: async () => {
          const response = await axios.get('/api/teams');
          return response.data.teams || [];
        },
      });
    },
    prefetchTeamMembers: (teamId: number) => {
      if (!teamId || teamId <= 0) return;
      queryClient.prefetchQuery({
        queryKey: ['team-members', teamId],
        queryFn: async () => {
          const response = await axios.get(`/api/teams/${teamId}/members?include_attendance=true`);
          const members = (response.data.members || []).filter((m: any) => m.user);
          return members;
        },
      });
    },
    prefetchAttendance: (teamId?: number | string) => {
      queryClient.prefetchQuery({
        queryKey: ['attendance', teamId || 'all'],
        queryFn: async () => {
          const url = teamId && teamId !== 'all'
            ? `/api/attendance?team_id=${teamId}`
            : '/api/attendance';
          const response = await axios.get(url);
          return response.data.entries || [];
        },
      });
    },
    prefetchReports: (teamId?: number | string) => {
      queryClient.prefetchQuery({
        queryKey: ['reports', teamId || 'all'],
        queryFn: async () => {
          const url = teamId && teamId !== 'all'
            ? `/api/reports?team_id=${teamId}`
            : '/api/reports';
          const response = await axios.get(url);
          return response.data.reports || [];
        },
      });
    },
  };
}

