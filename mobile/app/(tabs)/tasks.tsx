import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';
import AppHeader from '../../components/AppHeader';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { taskService } from '@/lib/task-service';
import { useAuth } from '@/contexts/AuthContext';

export default function TasksScreen() {
    const { token } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        if (token) {
            fetchTasks();
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const fetchTasks = async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const { tasks, error } = await taskService.getTasks(token);
            if (error) {
                setError(error);
                setTasks([]);
            } else {
                setTasks(tasks || []);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch tasks');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTaskCompletion = async (taskId: number, currentStatus: string) => {
        if (!token) return;
        // Optimistic update
        const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            await taskService.updateTask(token, taskId, { status: newStatus });
        } catch (err: any) {
            // Revert on error
            console.error('Failed to update task status:', err);
            fetchTasks(); // Refresh to ensure consistency
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        if (filter === 'completed') return task.status === 'completed';
        if (filter === 'active') return task.status !== 'completed';
        return true;
    });

    const priorityColors: Record<string, string> = {
        high: Colors.danger,
        medium: Colors.warning,
        low: Colors.success,
        urgent: Colors.danger,
    };

    const renderTask = ({ item }: any) => (
        <GlassCard intensity="medium" style={styles.taskCard}>
            <View style={styles.taskHeader}>
                <TouchableOpacity
                    style={[styles.checkbox, item.status === 'completed' && styles.checkboxCompleted]}
                    onPress={() => toggleTaskCompletion(item.id, item.status)}
                >
                    {item.status === 'completed' && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
                <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, item.status === 'completed' && styles.taskCompleted]}>{item.title}</Text>
                    <View style={styles.taskMeta}>
                        {item.project && <Text style={styles.projectTag}>{item.project.name || 'Project'}</Text>}
                        {item.project && <Text style={styles.separator}>•</Text>}
                        <Text style={styles.dueDate}>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No date'}</Text>
                    </View>
                </View>
                {item.priority && (
                    <View style={[styles.priorityBadge, { backgroundColor: `${priorityColors[item.priority.toLowerCase()] || Colors.text.tertiary}20` }]}>
                        <Text style={[styles.priorityText, { color: priorityColors[item.priority.toLowerCase()] || Colors.text.tertiary }]}>
                            {item.priority}
                        </Text>
                    </View>
                )}
            </View>
        </GlassCard>
    );

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <AppHeader />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Tasks</Text>
                        <TouchableOpacity style={styles.addButton} onPress={() => { /* Create task */ }}>
                            <Ionicons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.filterRow}>
                        <TouchableOpacity
                            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                            onPress={() => setFilter('all')}
                        >
                            <Text style={filter === 'all' ? styles.filterTextActive : styles.filterText}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
                            onPress={() => setFilter('active')}
                        >
                            <Text style={filter === 'active' ? styles.filterTextActive : styles.filterText}>Active</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
                            onPress={() => setFilter('completed')}
                        >
                            <Text style={filter === 'completed' ? styles.filterTextActive : styles.filterText}>Completed</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchTasks}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : filteredTasks.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="checkmark-done-circle-outline" size={64} color={Colors.text.tertiary} />
                            <Text style={styles.emptyText}>No tasks found</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredTasks}
                            renderItem={renderTask}
                            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            refreshing={isLoading}
                            onRefresh={fetchTasks}
                        />
                    )}
                </View>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
        marginTop: Spacing.xs,
    },
    title: {
        fontSize: 20,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: Spacing.sm,
    },
    filterButton: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.glass.subtle,
    },
    filterButtonActive: {
        backgroundColor: Colors.primary,
    },
    filterText: {
        fontSize: 11,
        color: Colors.text.secondary,
        fontWeight: Typography.weights.medium,
    },
    filterTextActive: {
        fontSize: 11,
        color: '#fff',
        fontWeight: Typography.weights.semibold,
    },
    listContent: {
        paddingBottom: 100,
    },
    taskCard: {
        padding: Spacing.xs,
        borderRadius: BorderRadius.sm,
        marginBottom: 4,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.border.medium,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxCompleted: {
        backgroundColor: Colors.success,
        borderColor: Colors.success,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
        color: Colors.text.primary,
        marginBottom: 2,
    },
    taskCompleted: {
        textDecorationLine: 'line-through',
        color: Colors.text.tertiary,
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    projectTag: {
        fontSize: Typography.sizes.xs,
        color: Colors.text.secondary,
    },
    separator: {
        fontSize: Typography.sizes.xs,
        color: Colors.text.tertiary,
    },
    dueDate: {
        fontSize: Typography.sizes.xs,
        color: Colors.text.tertiary,
    },
    priorityBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    priorityText: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
        textTransform: 'capitalize',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    errorText: {
        color: Colors.danger,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    retryButton: {
        padding: Spacing.md,
        backgroundColor: Colors.glass.medium,
        borderRadius: BorderRadius.md,
    },
    retryText: {
        color: Colors.text.primary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.text.secondary,
        marginTop: Spacing.md,
    },
});
