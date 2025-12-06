import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';
import AppHeader from '../../components/AppHeader';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { taskService } from '@/lib/task-service';

export default function TimeTrackingScreen() {
    const { token } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTimer, setActiveTimer] = useState<number | null>(null);

    useEffect(() => {
        if (token) fetchTasks();
    }, [token]);

    const fetchTasks = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const { tasks: fetchedTasks } = await taskService.getTasks(token);
            setTasks(fetchedTasks || []);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTimer = (taskId: number) => {
        if (activeTimer === taskId) {
            setActiveTimer(null);
            // In real app, call service to stop timer
        } else {
            setActiveTimer(taskId);
            // In real app, call service to start timer
        }
    };

    const renderTimeEntry = ({ item }: any) => (
        <GlassCard intensity="medium" style={styles.entryCard}>
            <View style={styles.entryHeader}>
                <View style={styles.entryInfo}>
                    <Text style={styles.taskName}>{item.title}</Text>
                    <Text style={styles.projectName}>{item.project?.name || 'No Project'}</Text>
                </View>
                <View style={styles.entryRight}>
                    <Text style={styles.duration}>{item.timeSpent ? `${Math.floor(item.timeSpent / 60)}h ${item.timeSpent % 60}m` : '0h 0m'}</Text>
                    {activeTimer === item.id && (
                        <View style={styles.runningIndicator}>
                            <View style={styles.pulsingDot} />
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.entryFooter}>
                <Text style={styles.dateText}>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Today'}</Text>
                <TouchableOpacity
                    style={activeTimer === item.id ? styles.stopButton : styles.playButton}
                    onPress={() => toggleTimer(item.id)}
                >
                    <Ionicons name={activeTimer === item.id ? "stop" : "play"} size={16} color={activeTimer === item.id ? "#fff" : Colors.primary} />
                    {activeTimer === item.id && <Text style={styles.buttonText}>Stop</Text>}
                </TouchableOpacity>
            </View>
        </GlassCard>
    );

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <AppHeader />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Time Tracking</Text>
                    </View>

                    {/* Timer and Summary Row */}
                    <View style={styles.topRow}>
                        <GlassCard intensity="heavy" style={styles.timerCardCompact}>
                            <TouchableOpacity style={styles.startButtonCompact}>
                                <Ionicons name={activeTimer ? "stop" : "play"} size={16} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.timerTextCompact}>{activeTimer ? "00:00:01" : "00:00:00"}</Text>
                        </GlassCard>
                        <GlassCard intensity="medium" style={styles.summaryCardCompact}>
                            <Ionicons name="time-outline" size={18} color={Colors.primary} />
                            <Text style={styles.summaryValueCompact}>0h 0m</Text>
                        </GlassCard>
                        <GlassCard intensity="medium" style={styles.summaryCardCompact}>
                            <Ionicons name="calendar-outline" size={18} color={Colors.success} />
                            <Text style={styles.summaryValueCompact}>0h 0m</Text>
                        </GlassCard>
                    </View>

                    {/* Recent Entries */}
                    <Text style={styles.sectionTitle}>Recent Tasks</Text>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
                    ) : tasks.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No tasks found</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={tasks}
                            renderItem={renderTimeEntry}
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
        marginBottom: Spacing.sm,
        marginTop: Spacing.xs,
    },
    title: {
        fontSize: 20,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
    },
    topRow: {
        flexDirection: 'row',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    timerCardCompact: {
        flex: 1.2,
        padding: Spacing.xs,
        borderRadius: BorderRadius.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    summaryCardCompact: {
        flex: 1,
        padding: Spacing.xs,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerTextCompact: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text.primary,
        fontVariant: ['tabular-nums'],
    },
    startButtonCompact: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryValueCompact: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },
    listContent: {
        paddingBottom: 100,
    },
    entryCard: {
        padding: Spacing.xs,
        borderRadius: BorderRadius.sm,
        marginBottom: 4,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    entryInfo: {
        flex: 1,
    },
    taskName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 2,
    },
    projectName: {
        fontSize: 12,
        color: Colors.text.tertiary,
    },
    entryRight: {
        alignItems: 'flex-end',
    },
    duration: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 4,
    },
    runningIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pulsingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.success,
    },
    entryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: Colors.text.tertiary,
    },
    stopButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.danger,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    playButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.glass.subtle,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: Colors.text.secondary,
    },
});
