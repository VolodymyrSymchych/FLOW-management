import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Хук для керування кешем дашборду
 * Автоматично оновлює дані кожну хвилину в фоні
 */
export function useDashboardCache() {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Інвалідувати всі запити дашборду кожну хвилину
        const interval = setInterval(() => {
            // Інвалідувати тільки якщо дані застарілі (більше 1 хвилини)
            queryClient.invalidateQueries({
                queryKey: ['dashboard'],
                refetchType: 'active', // Рефетчити тільки активні запити
            });

            queryClient.invalidateQueries({
                queryKey: ['stats'],
                refetchType: 'active',
            });

            queryClient.invalidateQueries({
                queryKey: ['projects'],
                refetchType: 'active',
            });

            queryClient.invalidateQueries({
                queryKey: ['tasks'],
                refetchType: 'active',
            });
        }, 60 * 1000); // Кожну хвилину

        return () => clearInterval(interval);
    }, [queryClient]);

    // Функції для ручного оновлення
    return {
        refreshDashboard: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        refreshStats: () => {
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
        refreshProjects: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        refreshTasks: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        refreshAll: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    };
}
