import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'tamagui';

export default function AIChatScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View flex={1} alignItems="center" justifyContent="center">
                <Text fontSize="$6" fontWeight="bold">AI Chat</Text>
                <Text>Chat with your AI assistant here.</Text>
            </View>
        </SafeAreaView>
    );
}
