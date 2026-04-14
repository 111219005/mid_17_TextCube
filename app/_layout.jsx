import "react-native-gesture-handler";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { TextLibraryProvider } from "../components/TextLibraryContext.jsx";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import Drawer from "../components/Drawer.jsx";
import TopBar from "../components/TopBar.jsx";
import BackgroundImage from "../components/BackgroundImage.jsx";

function AppLayoutContent() {
    const insets = useSafeAreaInsets();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const MyTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: 'transparent',
        },
    };

    return (
        <ThemeProvider value={MyTheme}>
            <BackgroundImage>
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    <TopBar onMenuPress={() => setIsMenuOpen(true)} />
                    <View style={styles.content}>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="index" />
                            <Stack.Screen name="AddTextLibrary" />
                            <Stack.Screen name="TextLibrary" />
                            <Stack.Screen name="Setting" />
                        </Stack>
                    </View>
                    <Drawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
                </View>
            </BackgroundImage>
        </ThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <TextLibraryProvider>
                <AppLayoutContent />
            </TextLibraryProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
    },
    content: {
        flex: 1,
    },
})
