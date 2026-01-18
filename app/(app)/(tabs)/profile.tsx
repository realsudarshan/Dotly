import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'tamagui';

export default function ProfileScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View flex={1} alignItems="center" justifyContent="center">
                <Text fontSize="$6" fontWeight="bold">Profile</Text>
                <Text>User profile settings and details.</Text>
            </View>
        </SafeAreaView>
    );
}
