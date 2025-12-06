import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';
import AppHeader from '../../components/AppHeader';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    const initials = user?.fullName
        ? `${user.fullName.split(' ')[0][0]}${user.fullName.split(' ')[1]?.[0] || ''}`
        : user?.username?.substring(0, 2).toUpperCase() || 'ME';

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <AppHeader />

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Profile</Text>
                    </View>

                    {/* Profile Card */}
                    <GlassCard intensity="medium" style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{initials}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: Colors.success }]} />
                        </View>
                        <Text style={styles.name}>{user?.fullName || user?.username || 'User'}</Text>
                        <Text style={styles.role}>{user?.username ? `@${user.username}` : 'Member'}</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                    </GlassCard>

                    {/* Settings Sections */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Preferences</Text>
                        <GlassCard intensity="medium" style={styles.settingsCard}>
                            <View style={styles.settingItem}>
                                <View style={styles.settingLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: Colors.iconBg.primary }]}>
                                        <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.settingLabel}>Notifications</Text>
                                </View>
                                <Switch
                                    trackColor={{ false: Colors.glass.medium, true: Colors.primary }}
                                    thumbColor="#fff"
                                    value={true}
                                />
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.settingItem}>
                                <View style={styles.settingLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: Colors.iconBg.secondary }]}>
                                        <Ionicons name="moon-outline" size={20} color={Colors.secondary} />
                                    </View>
                                    <Text style={styles.settingLabel}>Dark Mode</Text>
                                </View>
                                <Switch
                                    trackColor={{ false: Colors.glass.medium, true: Colors.secondary }}
                                    thumbColor="#fff"
                                    value={true}
                                    disabled
                                />
                            </View>
                        </GlassCard>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account</Text>
                        <GlassCard intensity="medium" style={styles.settingsCard}>
                            <TouchableOpacity style={styles.settingItem}>
                                <View style={styles.settingLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: Colors.iconBg.neutral }]}>
                                        <Ionicons name="person-outline" size={20} color={Colors.text.primary} />
                                    </View>
                                    <Text style={styles.settingLabel}>Edit Profile</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
                            </TouchableOpacity>
                            <View style={styles.divider} />
                            <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                                <View style={styles.settingLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: Colors.iconBg.danger }]}>
                                        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
                                    </View>
                                    <Text style={[styles.settingLabel, { color: Colors.danger }]}>Log Out</Text>
                                </View>
                            </TouchableOpacity>
                        </GlassCard>
                    </View>
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
        paddingHorizontal: Spacing.sm,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        marginBottom: Spacing.md,
        marginTop: Spacing.xs,
    },
    title: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
    },
    profileCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.glass.heavy,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    avatarText: {
        fontSize: Typography.sizes['3xl'],
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    statusBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.card.default,
    },
    name: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
        marginBottom: 2,
    },
    role: {
        fontSize: Typography.sizes.sm,
        color: Colors.primary,
        fontWeight: Typography.weights.medium,
        marginBottom: 4,
    },
    email: {
        fontSize: Typography.sizes.sm,
        color: Colors.text.secondary,
        marginBottom: Spacing.lg,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    settingsCard: {
        padding: 0,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: Typography.sizes.base,
        color: Colors.text.primary,
        fontWeight: Typography.weights.medium,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border.subtle,
        marginLeft: 56, // Align with text
    },
});
