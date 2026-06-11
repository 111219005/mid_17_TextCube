import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "../context/ThemeContext";
import { useMemo } from "react";

export default function Drawer({ isOpen, onClose }) {
    const router = useRouter();
    const { theme } = useTheme();

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => false,
                onMoveShouldSetPanResponder: (evt, gestureState) => {
                    const { dx, dy } = gestureState;
                    return Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy);
                },
                onPanResponderRelease: (evt, gestureState) => {
                    const { dx, vx } = gestureState;
                    const swipeThreshold = 80;
                    const velocityThreshold = 0.3;
                    if (dx < -swipeThreshold || (dx < -40 && vx < -velocityThreshold)) {
                        onClose();
                    }
                },
            }),
        [onClose]
    );

    if (!isOpen) {
        return null;
    }

    return (

        <View style={styles.overlay} {...panResponder.panHandlers}>
            <View style={[styles.drawer, { backgroundColor: theme.colors.card }]}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>TextCube</Text>
                    </View>
                    <View style={[styles.line, { backgroundColor: theme.dark ? '#666' : '#eee' }]} />

                    <TouchableOpacity onPress={() => { onClose(); router.replace("/"); }}>
                        <View style={[styles.item, styles.firstItem]}>
                            <Text style={[styles.itemText, { color: theme.colors.text }]}>文字庫。</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { onClose(); router.replace("/"); }}>
                        <View style={styles.item}>
                            <Text style={[styles.itemText, { color: theme.colors.text }]}>分類。</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { onClose(); router.replace("/"); }}>
                        <View style={styles.item}>
                            <Text style={[styles.itemText, { color: theme.colors.text }]}>垃圾桶。</Text>
                        </View>
                    </TouchableOpacity>
                                
                    <TouchableOpacity onPress={() => { onClose(); router.push("/Setting"); }}>
                        <View style={styles.item}>
                            <Text style={[styles.itemText, { color: theme.colors.text }]}>設定。</Text>
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
        paddingLeft: 36,
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
        left: -36,
    },
    firstItem: {
        marginTop: 8,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
    },
    itemText: {
        fontSize: 20,
        fontWeight: "500",
    },
});
