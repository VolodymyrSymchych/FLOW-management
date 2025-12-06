import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '../constants/theme';
import { BlurView } from 'expo-blur';

export default function AppHeader() {
    const router = useRouter();
    // Mock user for testing
    const mockUser = { fullName: 'Test User' };

    return (
        <BlurView intensity={30} tint="dark" style={styles.headerContainer}>
            <View style={styles.topHeader}>
                <TouchableOpacity
                    style={styles.avatarButton}
                    onPress={() => router.push('/(tabs)/profile')}
                >
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {mockUser.fullName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.rightButtons}>
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={() => router.push('/(tabs)/search')}
                    >
                        <Ionicons name="search-outline" size={22} color={Colors.text.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => router.push('/(tabs)/notifications')}
                    >
                        <Ionicons name="notifications-outline" size={22} color={Colors.text.primary} />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>5</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.chatButton}>
                        <Ionicons name="chatbubble-outline" size={22} color={Colors.text.primary} />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>3</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.homeButton}
                        onPress={() => router.push('/(tabs)/dashboard')}
                    >
                        <Ionicons name="home-outline" size={22} color={Colors.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </BlurView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        overflow: 'hidden',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.subtle,
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.glass.subtle,
    },
    avatarButton: {
        padding: 4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    avatarText: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: '#fff',
    },
    homeButton: {
        padding: 8,
        marginLeft: 8,
    },
    rightButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchButton: {
        padding: 8,
    },
    notificationButton: {
        padding: 8,
        position: 'relative',
    },
    chatButton: {
        padding: 8,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: Colors.danger,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: Colors.background.secondary,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
