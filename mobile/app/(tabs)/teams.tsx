import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';
import AppHeader from '../../components/AppHeader';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { teamService } from '@/lib/team-service';
import { useAuth } from '@/contexts/AuthContext';

export default function TeamsScreen() {
    const { token } = useAuth();
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            fetchTeam();
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const fetchTeam = async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const { members, error } = await teamService.getMembers(token);
            if (error) {
                setError(error);
            } else {
                setMembers(members || []);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch team members');
        } finally {
            setIsLoading(false);
        }
    };

    const statusColors: Record<string, string> = {
        online: Colors.success,
        away: Colors.warning,
        offline: Colors.text.tertiary,
        busy: Colors.danger,
    };

    const renderMember = ({ item }: any) => {
        const initials = item.firstName && item.lastName
            ? `${item.firstName[0]}${item.lastName[0]}`
            : item.username?.substring(0, 2).toUpperCase() || '??';

        const status = item.status || 'offline';

        return (
            <GlassCard intensity="medium" style={styles.memberCard}>
                <View style={styles.memberHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <View style={[styles.statusDot, { backgroundColor: statusColors[status] || statusColors.offline }]} />
                    </View>
                    <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{item.firstName} {item.lastName}</Text>
                        <Text style={styles.memberRole}>{item.role || 'Member'}</Text>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-horizontal" size={20} color={Colors.text.secondary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.memberStats}>
                    <View style={styles.statItem}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={Colors.text.tertiary} />
                        <Text style={styles.statText}>{item.completedTasksCount || 0} tasks</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColors[status] || statusColors.offline}20` }]}>
                        <Text style={[styles.statusText, { color: statusColors[status] || statusColors.offline }]}>
                            {status}
                        </Text>
                    </View>
                </View>
            </GlassCard>
        );
    };

    // Calculate dynamic stats
    const totalMembers = members.length;
    const onlineMembers = members.filter(m => m.status === 'online').length;
    // Assuming we might have task counts in the member object or just placeholder for now since we fetching members
    const totalTasks = members.reduce((acc, curr) => acc + (curr.completedTasksCount || 0), 0);

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <AppHeader />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Teams</Text>
                        <TouchableOpacity style={styles.addButton}>
                            <Ionicons name="person-add" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Team Stats */}
                    <View style={styles.statsRow}>
                        <GlassCard intensity="medium" style={styles.statCard}>
                            <Ionicons name="people" size={24} color={Colors.primary} />
                            <Text style={styles.statValue}>{totalMembers}</Text>
                            <Text style={styles.statLabel}>Members</Text>
                        </GlassCard>
                        <GlassCard intensity="medium" style={styles.statCard}>
                            <Ionicons name="wifi" size={24} color={Colors.success} />
                            <Text style={styles.statValue}>{onlineMembers}</Text>
                            <Text style={styles.statLabel}>Online</Text>
                        </GlassCard>
                        <GlassCard intensity="medium" style={styles.statCard}>
                            <Ionicons name="checkmark-done" size={24} color={Colors.warning} />
                            <Text style={styles.statValue}>{totalTasks}</Text>
                            <Text style={styles.statLabel}>Tasks Done</Text>
                        </GlassCard>
                    </View>

                    {/* Team Members */}
                    <Text style={styles.sectionTitle}>Team Members</Text>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchTeam}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : members.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color={Colors.text.tertiary} />
                            <Text style={styles.emptyText}>No team members found</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={members}
                            renderItem={renderMember}
                            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            refreshing={isLoading}
                            onRefresh={fetchTeam}
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
        marginBottom: Spacing.sm,
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
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    statCard: {
        flex: 1,
        padding: Spacing.xs,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
    },
    statValue: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
        marginTop: Spacing.xs,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: Typography.sizes.xs,
        color: Colors.text.secondary,
    },
    sectionTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    listContent: {
        paddingBottom: 100,
    },
    memberCard: {
        padding: Spacing.xs,
        borderRadius: BorderRadius.sm,
        marginBottom: 4,
    },
    memberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: Spacing.sm,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.bold,
        color: '#fff',
    },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.background.secondary,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        color: Colors.text.primary,
        marginBottom: 2,
    },
    memberRole: {
        fontSize: Typography.sizes.xs,
        color: Colors.text.secondary,
    },
    moreButton: {
        padding: 4,
    },
    memberStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: Typography.sizes.xs,
        color: Colors.text.tertiary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusText: {
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
