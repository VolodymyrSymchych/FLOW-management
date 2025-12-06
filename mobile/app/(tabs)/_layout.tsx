import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, Platform } from 'react-native';
import { Colors } from '../../constants/theme';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.text.tertiary,
                tabBarStyle: {
                    position: 'absolute',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 80,
                    paddingTop: 10,
                    paddingBottom: 10,
                    backgroundColor: Platform.select({
                        ios: 'transparent',
                        android: Colors.background.secondary, // Fallback for android
                    }),
                    borderTopColor: 'transparent',
                },
                tabBarBackground: () => (
                    <BlurView
                        tint="dark"
                        intensity={80}
                        style={[
                            StyleSheet.absoluteFill,
                            { overflow: 'hidden', borderTopLeftRadius: 20, borderTopRightRadius: 20 }
                        ]}
                    />
                ),
                headerShown: false,
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 9,
                    marginBottom: 8,
                    fontWeight: '500',
                },
                tabBarIconStyle: {
                    marginTop: 0,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    href: null, // Accessible via header home button
                }}
            />
            <Tabs.Screen
                name="projects"
                options={{
                    title: 'Projects',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "folder" : "folder-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="tasks"
                options={{
                    title: 'Tasks',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "checkmark-circle" : "checkmark-circle-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="charts"
                options={{
                    title: 'Charts',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="timetracking"
                options={{
                    title: 'Time',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "time" : "time-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="teams"
                options={{
                    title: 'Teams',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "people" : "people-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="documentation"
                options={{
                    title: 'Docs',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "document-text" : "document-text-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    href: null, // Hide from tab bar - accessible via header
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    href: null, // Hide from tab bar - accessible via header
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
        </Tabs>
    );
}

