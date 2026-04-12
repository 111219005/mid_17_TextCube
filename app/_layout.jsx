import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { TextLibraryProvider } from "../components/TextLibraryContext.jsx";

export default function RootLayout() {
    return (
        <TextLibraryProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="AddTextLibrary" />
                <Stack.Screen name="TextLibrary" />
                <Stack.Screen name="Setting" />
            </Stack>
        </TextLibraryProvider>
    );
}
