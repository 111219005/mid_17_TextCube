import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "../context/ThemeContext";

export default function Drawer({ isOpen, onClose }) {
    const router = useRouter();
    const { theme } = useTheme();

    if (!isOpen) {
        return null;
    }

    return (

        <View style={styles.overlay}>
            <View style={[styles.drawer, { backgroundColor: theme.colors.card }]}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>TextCube</Text>
                    </View>
                    <View style={[styles.line, { backgroundColor: theme.dark ? '#666' : '#eee' }]} />

                    <TouchableOpacity onPress={() => { onClose(); router.replace("/"); }}>
                        <View style={[styles.item, styles.firstItem]}>
                            <Text style={[styles.itemText, { color: theme.colors.text }]}>首頁</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            router.push("/TextLibrary");
                            onClose();
                        }}
                    >
                        <View style={styles.item}>
                            <Text style={[styles.itemText, { color: theme.colors.text }]}>文字庫</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            router.push("/AddTextLibrary");
                            onClose();
                        }}
                    >
                        <View style={styles.item}>
                            <Text style={[styles.itemText, { color: theme.colors.text }]}>新增文字庫</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            router.push("/Setting");
                            onClose();
                        }}
                    >
                        <View style={styles.item}>
                            <Text style={[styles.itemText, { color: theme.colors.text }]}>設定</Text>
                        </View>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>

            <TouchableOpacity
                style={styles.backdrop}
                onPress={onClose}
                activeOpacity={1}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
        flexDirection: "row",
    },
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    drawer: {
        width: 300,
        height: "100%",
        paddingLeft: 16,
        elevation: 22,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    titleContainer: {
        height: 67,
        // backgroundColor: "yellow"
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 16,
        // backgroundColor: "pink",
    },
    line: {
        height: 1,
        width: 300,
        left: -16,
    },
    firstItem: {
        marginTop: 8,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
    },
    itemText: {
        fontSize: 16,
        fontWeight: "500",
    },
});
