import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, RefreshControl, DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';
import AppHeader from '../../components/AppHeader';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { projectService } from '@/lib/project-service';
import { taskService } from '@/lib/task-service';
import { teamService } from '@/lib/team-service';

export default function ChartsScreen() {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [taskStats, setTaskStats] = useState<any>(null);
    const [projectStats, setProjectStats] = useState<any>(null);
    const [teamCount, setTeamCount] = useState(0);

    const fetchData = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const [pStats, tStats, tMembers] = await Promise.all([
                projectService.getStats(token),
                taskService.getStats(token),
                teamService.getMembers(token)
            ]);

            if (pStats.stats) setProjectStats(pStats.stats);
            if (tStats.stats) {
                setTaskStats(tStats.stats);
            }
            if (tMembers.members) setTeamCount(tMembers.members.length);

        } catch (error) {
            console.error('Failed to fetch chart data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    // Mock data for Bar Chart (Last 7 days)
    const barData: { day: string; height: DimensionValue }[] = [
        { day: 'M', height: '40%' },
        { day: 'T', height: '60%' },
        { day: 'W', height: '30%' },
        { day: 'T', height: '70%' },
        { day: 'F', height: '50%' },
        { day: 'S', height: '20%' },
        { day: 'S', height: '65%' },
    ];

    // Mock data for Donut Charts
    const donutData = [
        { label: 'Mobile App', percentage: 75, color: Colors.success }, // Green for high progress
        { label: 'API', percentage: 45, color: Colors.warning },        // Yellow for medium
        { label: 'Dashboard', percentage: 90, color: Colors.primary },  // Blue/Primary for completed
    ];

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <AppHeader />

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} tintColor={Colors.primary} />}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Charts</Text>
                        <Text style={styles.subtitle}>Real-time analytics</Text>
                    </View>

                    {isLoading && !taskStats ? (
                        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
                    ) : (
                        <>
                            {/* 1. Task Completion (Bar Chart) */}
                            <GlassCard intensity="medium" style={styles.chartCard}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>Task Completion</Text>
                                    <View style={styles.trendContainer}>
                                        <Text style={styles.trendText}>+15%</Text>
                                        <Ionicons name="caret-up" size={12} color={Colors.success} style={{ marginLeft: 2 }} />
                                    </View>
                                </View>

                                <View style={styles.barChartContainer}>
                                    <View style={styles.barsRow}>
                                        {barData.map((item, index) => (
                                            <View key={index} style={styles.barWrapper}>
                                                <View style={[styles.bar, { height: item.height }]} />
                                                <Text style={styles.barLabel}>{item.day}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </GlassCard>

                            {/* 2. Project Progress (Donut Charts) */}
                            <GlassCard intensity="medium" style={styles.chartCard}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>Project Progress</Text>
                                    <Ionicons name="pie-chart" size={20} color={Colors.primary} />
                                </View>

                                <View style={styles.donutsRow}>
                                    {donutData.map((item, index) => (
                                        <View key={index} style={styles.donutContainer}>
                                            <View style={[styles.donut, { borderColor: item.color }]}>
                                                <Text style={styles.donutText}>{item.percentage}%</Text>
                                            </View>
                                            <Text style={styles.donutLabel}>{item.label}</Text>
                                        </View>
                                    ))}
                                </View>
                            </GlassCard>

                            {/* 3. Team Performance (Stats Grid) */}
                            <GlassCard intensity="medium" style={styles.chartCard}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>Team Performance</Text>
                                    <Ionicons name="people" size={20} color={Colors.secondary} />
                                </View>
                                <View style={styles.statsGrid}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>{taskStats?.completed || 24}</Text>
                                        <Text style={styles.statLabel}>Tasks Done</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>{taskStats?.inProgress || 12}</Text>
                                        <Text style={styles.statLabel}>In Progress</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>{teamCount || 5}</Text>
                                        <Text style={styles.statLabel}>Members</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>{projectStats?.active || 3}</Text>
                                        <Text style={styles.statLabel}>Projects</Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </>
                    )}
                </ScrollView>
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
    },
    scrollContent: {
        padding: Spacing.sm,
        paddingBottom: 100,
    },
    header: {
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.xs,
    },
    title: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.text.tertiary,
    },
    chartCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    cardTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
    },

    // Bar Chart Styles
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.glass.subtle,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    trendText: {
        color: Colors.success,
        fontSize: 12,
        fontWeight: 'bold',
    },
    barChartContainer: {
        height: 150,
        justifyContent: 'flex-end',
    },
    barsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: '100%',
        paddingBottom: 20, // Space for labels
    },
    barWrapper: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'flex-end',
        flex: 1,
    },
    bar: {
        width: 8, // Thin vertical line
        backgroundColor: Colors.primary,
        borderRadius: 4,
        marginBottom: 8,
    },
    barLabel: {
        fontSize: 10,
        color: Colors.text.tertiary,
        position: 'absolute',
        bottom: -20,
    },

    // Donut Chart Styles
    donutsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Spread them out
        paddingHorizontal: Spacing.xs,
    },
    donutContainer: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    donut: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 6,
        justifyContent: 'center',
        alignItems: 'center',
        // Border color is set inline
    },
    donutText: {
        fontSize: 14,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
    },
    donutLabel: {
        fontSize: 12,
        color: Colors.text.secondary,
        fontWeight: '500',
    },

    // Stats Grid Styles
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    statItem: {
        width: '47%', // Slightly less than 50% to account for gap
        backgroundColor: Colors.glass.subtle,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'flex-start',
    },
    statValue: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.text.secondary,
        fontWeight: '500',
    },
});
