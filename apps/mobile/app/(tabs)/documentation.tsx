import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';
import AppHeader from '../../components/AppHeader';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

export default function DocumentationScreen() {
    return (
        <GradientBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <AppHeader />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Documentation</Text>
                    </View>

                    <GlassCard intensity="medium" style={styles.infoCard}>
                        <Ionicons name="document-text-outline" size={48} color={Colors.text.secondary} />
                        <Text style={styles.infoTitle}>No Documentation Available</Text>
                        <Text style={styles.infoText}>
                            Project documentation will appear here once connected to the Documentation Service.
                        </Text>
                    </GlassCard>
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
        paddingTop: Spacing.md,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 20,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
    },
    infoCard: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
    },
    infoTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
        marginTop: Spacing.sm,
    },
    infoText: {
        fontSize: Typography.sizes.base,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
});
