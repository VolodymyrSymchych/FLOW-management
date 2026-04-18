import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';
import AppHeader from '../../components/AppHeader';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { teamService } from '@/lib/team-service';
import { useAuth } from '@/contexts/AuthContext';

interface Team {
    id: number;
    name: string;
    description?: string | null;
    ownerId?: number;
}

export default function TeamsScreen() {
    const { token, selectedTeamId, setSelectedTeamId } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            fetchTeams();
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const fetchTeams = async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const { teams: fetchedTeams, error: fetchError } = await teamService.getTeams(token);
            if (fetchError) {
                setError(fetchError);
                setTeams([]);
                return;
            }

            const nextTeams = fetchedTeams || [];
            setTeams(nextTeams);

            const hasSelectedTeam = selectedTeamId
                ? nextTeams.some((team) => team.id === selectedTeamId)
                : false;

            if (selectedTeamId && !hasSelectedTeam) {
                await setSelectedTeamId(null);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch workspaces');
            setTeams([]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTeam = ({ item }: { item: Team }) => {
        const isSelected = item.id === selectedTeamId;
        const cardStyle = isSelected
            ? { ...styles.teamCard, ...styles.teamCardSelected }
            : styles.teamCard;

        return (
            <TouchableOpacity activeOpacity={0.85} onPress={() => setSelectedTeamId(isSelected ? null : item.id)}>
                <GlassCard intensity="medium" style={cardStyle}>
                    <View style={styles.teamHeader}>
                        <View style={styles.teamIcon}>
                            <Ionicons name="people" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.teamInfo}>
                            <Text style={styles.teamName}>{item.name}</Text>
                            <Text style={styles.teamDescription}>
                                {item.description || 'Workspace for team collaboration'}
                            </Text>
                        </View>
                        <View style={styles.teamActions}>
                            {isSelected ? (
                                <View style={styles.selectedBadge}>
                                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                                    <Text style={styles.selectedText}>Active</Text>
                                </View>
                            ) : (
                                <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
                            )}
                        </View>
                    </View>
                </GlassCard>
            </TouchableOpacity>
        );
    };

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <AppHeader />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Workspaces</Text>
                            <Text style={styles.subtitle}>Your last selected workspace is restored automatically</Text>
                        </View>
                        {selectedTeamId ? (
                            <TouchableOpacity style={styles.clearButton} onPress={() => setSelectedTeamId(null)}>
                                <Text style={styles.clearButtonText}>All</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchTeams}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : teams.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color={Colors.text.tertiary} />
                            <Text style={styles.emptyText}>No workspaces found</Text>
                            <Text style={styles.emptySubtext}>When you join or create one, it will appear here.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={teams}
                            renderItem={renderTeam}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            refreshing={isLoading}
                            onRefresh={fetchTeams}
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
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
        marginTop: Spacing.xs,
        gap: Spacing.sm,
    },
    title: {
        fontSize: 20,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
    },
    subtitle: {
        fontSize: 11,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    clearButton: {
        minWidth: 44,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.glass.medium,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    clearButtonText: {
        color: Colors.text.primary,
        fontWeight: Typography.weights.semibold,
        fontSize: 12,
    },
    listContent: {
        paddingBottom: 100,
    },
    teamCard: {
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    teamCardSelected: {
        borderColor: `${Colors.success}66`,
    },
    teamHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    teamIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.glass.medium,
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamInfo: {
        flex: 1,
    },
    teamName: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
        marginBottom: 4,
    },
    teamDescription: {
        fontSize: Typography.sizes.xs,
        color: Colors.text.secondary,
    },
    teamActions: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    selectedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    selectedText: {
        color: Colors.success,
        fontSize: 12,
        fontWeight: Typography.weights.semibold,
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
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    retryText: {
        color: '#fff',
        fontWeight: Typography.weights.semibold,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    emptyText: {
        color: Colors.text.primary,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        marginTop: Spacing.md,
    },
    emptySubtext: {
        color: Colors.text.secondary,
        textAlign: 'center',
        marginTop: Spacing.xs,
    },
});
