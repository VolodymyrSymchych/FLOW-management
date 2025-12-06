import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';
import AppHeader from '../../components/AppHeader';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardScreen() {
    const router = useRouter();
    const { stats, projects, loading, error, refresh, highRiskCount, activeProjectsCount } = useDashboard();

    const onRefresh = React.useCallback(async () => {
        await refresh();
    }, [refresh]);

    // Widget Component to replicate the screenshot style
    const StatWidget = ({ title, value, subtitle, dotColor, icon, progress }: any) => (
        <GlassCard intensity="heavy" style={styles.widgetCard}>
            <View style={styles.widgetHeader}>
                <View style={styles.widgetTitleContainer}>
                    <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
                    <Text style={styles.widgetTitle}>{title}</Text>
                </View>
                <View style={styles.widgetIconContainer}>
                    <Ionicons name={icon} size={14} color={Colors.text.secondary} />
                </View>
            </View>

            <View style={styles.widgetContent}>
                <Text style={styles.widgetValue}>{value}</Text>
                <Text style={styles.widgetSubtitle}>{subtitle}</Text>
            </View>

            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: dotColor }]} />
            </View>
        </GlassCard>
    );

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <AppHeader />

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.primary} />
                    }
                >
                    <View style={styles.headerSection}>
                        <Text style={styles.pageTitle}>Dashboard overview</Text>
                        <Text style={styles.pageSubtitle}>Track your projects and tasks</Text>
                    </View>

                    {error ? (
                        <GlassCard intensity="medium" style={styles.errorCard}>
                            <Ionicons name="alert-circle-outline" size={40} color={Colors.danger} />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </GlassCard>
                    ) : loading && !stats ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Text style={styles.loadingText}>Loading dashboard data...</Text>
                        </View>
                    ) : (
                        <>
                            {/* Grid of Widgets */}
                            <View style={styles.gridContainer}>
                                <View style={styles.row}>
                                    <StatWidget
                                        title="Active Projects"
                                        value={activeProjectsCount.toString()}
                                        subtitle={stats?.trends?.projects_in_progress?.value
                                            ? `${stats.trends.projects_in_progress.value}% from last month`
                                            : 'In progress'}
                                        dotColor={Colors.status.red}
                                        icon="folder-outline"
                                        progress={activeProjectsCount > 0 ? Math.min((activeProjectsCount / (stats?.total_projects || 1)) * 100, 100) : 0}
                                    />
                                    <StatWidget
                                        title="Completion Rate"
                                        value={`${Math.round(stats?.completion_rate || 0)}%`}
                                        subtitle="Based on tasks"
                                        dotColor={Colors.status.orange}
                                        icon="trending-up-outline"
                                        progress={stats?.completion_rate || 0}
                                    />
                                </View>
                                <View style={styles.row}>
                                    <StatWidget
                                        title="Total Projects"
                                        value={stats?.total_projects?.toString() || '0'}
                                        subtitle="All time"
                                        dotColor={Colors.status.blue}
                                        icon="checkmark-circle-outline"
                                        progress={stats?.total_projects ? Math.min((stats.total_projects / 10) * 100, 100) : 0}
                                    />
                                    <StatWidget
                                        title="High Risk"
                                        value={highRiskCount.toString()}
                                        subtitle="Requires attention"
                                        dotColor={Colors.status.yellow}
                                        icon="alert-circle-outline"
                                        progress={highRiskCount > 0 ? Math.min((highRiskCount / (stats?.total_projects || 1)) * 100, 100) : 0}
                                    />
                                </View>
                            </View>

                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Budget vs Actual</Text>
                                <Ionicons name="stats-chart-outline" size={20} color={Colors.text.secondary} />
                            </View>

                            <GlassCard intensity="heavy" style={styles.budgetCard}>
                                <View style={styles.budgetHeader}>
                                    <View style={[styles.statusDot, { backgroundColor: Colors.status.purple }]} />
                                    <Text style={styles.widgetTitle}>Budget Analysis</Text>
                                </View>
                                <View style={styles.budgetContent}>
                                    {(() => {
                                        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
                                        const budgetLimit = 100000;
                                        const utilization = totalBudget > 0 ? ((totalBudget / budgetLimit) * 100).toFixed(1) : '0.0';
                                        return (
                                            <>
                                                <Text style={styles.budgetValue}>
                                                    ${totalBudget.toLocaleString()} / ${(budgetLimit / 1000).toFixed(0)}k
                                                </Text>
                                                <Text style={styles.budgetSubtitle}>{utilization}% utilized</Text>
                                            </>
                                        );
                                    })()}
                                </View>
                                <View style={styles.budgetFooter}>
                                    <View>
                                        <Text style={styles.budgetLabel}>Remaining</Text>
                                        <Text style={styles.budgetStat}>
                                            ${((100000 - projects.reduce((sum, p) => sum + (p.budget || 0), 0)) / 1000).toFixed(0)}k
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.budgetLabel}>Forecast</Text>
                                        <Text style={styles.budgetStat}>
                                            ~${(projects.reduce((sum, p) => sum + (p.budget || 0), 0) / 1000).toFixed(0)}k
                                        </Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </>
                    )}

                    {/* Add padding at bottom for tab bar */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: Spacing.md,
        paddingBottom: 20,
    },
    headerSection: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
        marginBottom: 4,
    },
    pageSubtitle: {
        fontSize: 13,
        color: Colors.text.tertiary,
    },
    errorCard: {
        marginHorizontal: Spacing.lg,
        padding: Spacing.xl,
        alignItems: 'center',
        borderRadius: BorderRadius.md,
    },
    errorText: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginTop: Spacing.md,
        marginBottom: Spacing.md,
    },
    retryButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
    },
    retryText: {
        color: Colors.text.primary,
        fontWeight: Typography.weights.semibold,
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing['4xl'],
    },
    loadingText: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginTop: Spacing.md,
    },
    gridContainer: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    widgetCard: {
        flex: 1,
        borderRadius: 12,
    },
    widgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    widgetTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    widgetTitle: {
        fontSize: 12,
        color: Colors.text.secondary,
        fontWeight: '500',
        flexShrink: 1,
    },
    widgetIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border.medium,
        justifyContent: 'center',
        alignItems: 'center',
    },
    widgetContent: {
        marginBottom: 6,
    },
    widgetValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 2,
    },
    widgetSubtitle: {
        fontSize: 9,
        color: Colors.text.tertiary,
    },
    progressContainer: {
        height: 4,
        backgroundColor: Colors.border.subtle,
        borderRadius: 2,
        width: '100%',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        marginTop: Spacing.sm,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    budgetCard: {
        marginHorizontal: Spacing.lg,
        borderRadius: 12,
        marginBottom: Spacing.md,
    },
    budgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    budgetContent: {
        marginBottom: 14,
    },
    budgetValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 2,
    },
    budgetSubtitle: {
        fontSize: 12,
        color: Colors.text.tertiary,
    },
    budgetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: Colors.border.subtle,
        paddingTop: 12,
    },
    budgetLabel: {
        fontSize: 11,
        color: Colors.text.tertiary,
        marginBottom: 3,
    },
    budgetStat: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
});
