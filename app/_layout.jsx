import "react-native-gesture-handler";
import { View, StyleSheet } from "react-native";
import { Stack, usePathname, useRouter } from "expo-router";
import { enableScreens } from "react-native-screens";
import { TextLibraryProvider } from "../components/TextLibraryContext.jsx";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { DefaultTheme } from "@react-navigation/native";
import Drawer from "../components/Drawer.jsx";
import NavBar from "../components/TopBar.jsx";
import BackTopBar from "../components/BackTopBar.jsx";
import BackgroundImage from "../components/BackgroundImage.jsx";
import { ThemeProvider as CustomThemeProvider, useTheme } from '../context/ThemeContext';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { StatusBar } from "react-native";

enableScreens();

function AppLayoutContent() {
    const insets = useSafeAreaInsets();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const isHomePage = pathname === "/";
    const isAddTextLibrary = pathname === "/AddTextLibrary";
    const { theme, isDark } = useTheme();

    let pageTitle = "";
    if (pathname === "/TextLibrary") {
        pageTitle = "文字庫";
    } else if (pathname === "/Setting") {
        pageTitle = "設定";
    }

    const navigationTheme = {
        ...DefaultTheme,
        dark: theme.dark,
        colors: {
            ...DefaultTheme.colors,
            background: 'transparent',
            card: theme.colors.tabBar,
            text: theme.colors.text,
        },
    };

    return (
        <>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={isDark ? "#000000" : "#FFFFFF"}
                translucent={true}
            />
            <NavThemeProvider value={navigationTheme}>
                <BackgroundImage>
                    <View style={[styles.container, { paddingTop: insets.top }]}>
                        {isHomePage ? (
                            <NavBar onMenuPress={() => setIsMenuOpen(true)} />
                        ) : (
                            <View style={isAddTextLibrary ? [styles.absoluteHeader, { top: insets.top }] : {}}>
                                <BackTopBar
                                    title={pageTitle}
                                    onBackPress={isAddTextLibrary ? () => router.replace('/TextLibrary') : undefined}
                                />
                            </View>
                        )}
                        <View style={styles.content}>
                            <Stack
                            screenOptions={{
                                headerShown: false,
                                animation: "none",
                                animationEnabled: false,
                                detachInactiveScreens: false,
                                detachPreviousScreen: false,
                            }}
                        >
                                <Stack.Screen name="index" />
                                <Stack.Screen name="AddTextLibrary" />
                                <Stack.Screen name="TextLibrary" />
                                <Stack.Screen name="Setting" />
                                <Stack.Screen name="DevTool" />
                            </Stack>
                        </View>
                        <Drawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
                    </View>
                </BackgroundImage>
            </NavThemeProvider>
        </>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <TextLibraryProvider>
                <CustomThemeProvider>
                    <AppLayoutContent />
                </CustomThemeProvider>
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
    absoluteHeader: {
        position: "absolute",
        zIndex: 100,
        width: "100%",
    },
})
