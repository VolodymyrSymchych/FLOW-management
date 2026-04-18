import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';
import AppHeader from '../../components/AppHeader';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

export default function SearchScreen() {
    return (
        <GradientBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <AppHeader />

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Search</Text>
                    </View>

                    <GlassCard intensity="medium" style={styles.searchCard}>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search-outline" size={20} color={Colors.text.tertiary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search projects, tasks, teams..."
                                placeholderTextColor={Colors.text.tertiary}
                            />
                        </View>
                    </GlassCard>

                    <GlassCard intensity="medium" style={styles.emptyState}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="search-outline" size={48} color={Colors.text.tertiary} />
                        </View>
                        <Text style={styles.emptyTitle}>Start Searching</Text>
                        <Text style={styles.emptySubtitle}>
                            Find projects, tasks, teams, and more.
                        </Text>
                    </GlassCard>
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
        padding: Spacing.lg,
    },
    header: {
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 32,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
    },
    searchCard: {
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xl,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: Typography.sizes.base,
        color: Colors.text.primary,
        paddingVertical: Spacing.sm,
    },
    emptyState: {
        padding: Spacing.xl,
        alignItems: 'center',
        borderRadius: BorderRadius.xl,
        marginBottom: 100,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.glass.subtle,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: Typography.sizes.base,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});
