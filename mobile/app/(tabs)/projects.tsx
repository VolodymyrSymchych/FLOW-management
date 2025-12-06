import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';
import AppHeader from '../../components/AppHeader';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { projectService } from '@/lib/project-service';
import { useAuth } from '@/contexts/AuthContext';

export default function ProjectsScreen() {
    const { token } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            fetchProjects();
        } else {
            // Wait for token or redirect if needed, but useAuth usually handles auth state
            // If token is null briefly on mount, it might cause a flash, but useEffect dependency handles it
            setIsLoading(false); // Stop loading if no token (e.g. unauthenticated)
        }
    }, [token]);

    const fetchProjects = async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const { projects, error } = await projectService.getProjects(token);
            if (error) {
                setError(error);
                setProjects([]); // Clear mock/stale data
            } else {
                setProjects(projects || []);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch projects');
        } finally {
            setIsLoading(false);
        }
    };

    const renderProject = ({ item }: any) => (
        <GlassCard intensity="medium" style={styles.projectCard}>
            <View style={styles.projectHeader}>
                <View style={styles.projectInfo}>
                    <Text style={styles.projectName}>{item.name}</Text>
                    <Text style={styles.projectType}>{item.industry || item.type || 'Project'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? Colors.success : Colors.primary }]}>
                    <Text style={styles.statusText}>{item.status || 'Active'}</Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressValue}>{item.progress || 0}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${item.progress || 0}%` }]} />
                </View>
            </View>

            <View style={styles.projectFooter}>
                <View style={styles.footerItem}>
                    <Ionicons name="documents-outline" size={16} color={Colors.text.secondary} />
                    <Text style={styles.footerText}>{item.tasksCount || 0} Tasks</Text>
                </View>
                <View style={styles.footerItem}>
                    <Ionicons name="people-outline" size={16} color={Colors.text.secondary} />
                    <Text style={styles.footerText}>{item.teamSize || 0} Team</Text>
                </View>
                {item.budget && (
                    <View style={styles.footerItem}>
                        <Ionicons name="wallet-outline" size={16} color={Colors.text.secondary} />
                        <Text style={styles.footerText}>${item.budget?.toLocaleString()}</Text>
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
                        <Text style={styles.title}>Projects</Text>
                        <TouchableOpacity style={styles.addButton} onPress={() => { /* Navigate to create project */ }}>
                            <Ionicons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchProjects}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : projects.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="folder-open-outline" size={64} color={Colors.text.tertiary} />
                            <Text style={styles.emptyText}>No projects found</Text>
                            <TouchableOpacity style={styles.createButton} onPress={() => { /* Create project */ }}>
                                <Text style={styles.createButtonText}>Create New Project</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={projects}
                            renderItem={renderProject}
                            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            refreshing={isLoading}
                            onRefresh={fetchProjects}
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
    listContent: {
        paddingBottom: 100,
    },
    projectCard: {
        padding: Spacing.xs,
        borderRadius: BorderRadius.sm,
        marginBottom: 4,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xs,
    },
    projectInfo: {
        flex: 1,
    },
    projectName: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
        marginBottom: 2,
    },
    projectType: {
        fontSize: 10,
        color: Colors.text.secondary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: Typography.weights.semibold,
        textTransform: 'capitalize',
    },
    progressContainer: {
        marginBottom: Spacing.xs,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    progressLabel: {
        fontSize: 10,
        color: Colors.text.secondary,
    },
    progressValue: {
        fontSize: 10,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: Colors.glass.subtle,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 2,
    },
    projectFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 10,
        color: Colors.text.secondary,
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
        marginBottom: Spacing.lg,
    },
    createButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.full,
    },
    createButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
