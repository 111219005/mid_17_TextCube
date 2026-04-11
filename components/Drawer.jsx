import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Drawer({ isOpen, onClose }) {
    const router = useRouter();

    if (!isOpen) {
        return null;
    }

    return (

        <View style={styles.overlay}>
            <View style={styles.drawer}>
                <SafeAreaView edges={['top']}>
                    <Text style={styles.title}>TextCube</Text>
                    <View style={styles.line} />

                    <TouchableOpacity onPress={() => { router.push("/"); onClose(); }}>
                        <View style={[styles.item, styles.firstItem]}>
                            <Text style={styles.itemText}>首頁</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            router.push("/TextLibrary");
                            onClose();
                        }}
                    >
                        <View style={styles.item}>
                            <Text style={styles.itemText}>文字庫</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            router.push("/AddTextLibrary");
                            onClose();
                        }}
                    >
                        <View style={styles.item}>
                            <Text style={styles.itemText}>新增文字庫</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            router.push("/Setting");
                            onClose();
                        }}
                    >
                        <View style={styles.item}>
                            <Text style={styles.itemText}>設定</Text>
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
        backgroundColor: "white",
        paddingLeft: 16,
        elevation: 22,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 16,
    },
    line: {
        height: 1,
        backgroundColor: "#EDEDEF",
        width: 300,
        left: -16,
        marginTop: 16,
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
