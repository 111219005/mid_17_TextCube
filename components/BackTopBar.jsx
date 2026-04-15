import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function BackTopBar({ title }) {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.icons}>
                    <Ionicons name="chevron-back-outline" size={24} color="#1E1E1E" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // backgroundColor: "lightgreen",
    },
    icons: {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },
});