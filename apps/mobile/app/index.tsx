import { Redirect } from 'expo-router';

export default function Index() {
    // Skip authentication for testing - go directly to dashboard
    return <Redirect href="/(tabs)/dashboard" />;
}
