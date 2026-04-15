import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from "../context/ThemeContext";

export default function BackTopBar( ) {
    const router = useRouter();
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.icons}>
                    <Ionicons name="chevron-back-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 4,
        // backgroundColor: "lightgreen",
    },
    icons: {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "pink",
    },
});