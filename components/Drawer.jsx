import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useTextLibraries } from "./TextLibraryContext";
import { useMemo } from "react";
import UserAvatarPreview from "./UserAvatarPreview";

export default function Drawer({ isOpen, onClose }) {
    const router = useRouter();
    const { theme } = useTheme();
    const { isSignedIn, user, signOut } = useAuth();
    const { libraries } = useTextLibraries();

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
    
    const totalEntries = libraries.reduce((sum, lib) => sum + (lib.entries?.length || 0), 0);

    return (

        <View style={styles.overlay} {...panResponder.panHandlers}>
            <View style={[styles.drawer, { backgroundColor: theme.colors.card }]}>
                <SafeAreaView edges={['top']} style={styles.safeArea}>
                    <View style={styles.headerContainer}>
                        <View style={styles.avatarSection}>
                            <UserAvatarPreview showPreviewModal={true} />
                        </View>
                        
                        <View style={styles.userInfoSection}>
                            {isSignedIn ? (
                                <View>
                                    <Text style={[styles.username, { color: theme.colors.text }]}>
                                        {user?.username || '使用者'}
                                    </Text>
                                    <Text style={[styles.libraryInfo, { color: theme.colors.text }]}>
                                        {libraries.length} 個文字庫 / {totalEntries} 個文字方塊
                                    </Text>
                                </View>
                            ) : (
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            onClose();
                                            router.push('/Login');
                                        }}
                                    >
                                        <Text style={[styles.loginButton, { color: theme.colors.primary }]}>
                                            登入/註冊
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={[styles.hint, { color: theme.colors.text }]}>
                                        登入即可使用完整功能
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={[styles.line, { backgroundColor: theme.dark ? '#666' : '#eee' }]} />

                    <TouchableOpacity onPress={() => { onClose(); router.replace("/"); }}>
                        <View style={[styles.item, styles.firstItem]}>
                            <Text style={[styles.itemText, { color: theme.colors.text }]}>文字庫。</Text>
                        </View>
                    </TouchableOpacity>
                                
                    <TouchableOpacity
                        onPress={() => {
                            router.push("/Setting");
                            onClose();
                        }}
                    >
                        <View style={styles.item}>
                            <Text style={[styles.itemText, { color: theme.colors.text }]}>設定。</Text>
                        </View>
                    </TouchableOpacity>

                    {isSignedIn && (
                        <TouchableOpacity
                            onPress={() => {
                                Alert.alert(
                                    '登出',
                                    '確定要登出嗎？',
                                    [
                                        { text: '取消', style: 'cancel' },
                                        {
                                            text: '登出',
                                            style: 'destructive',
                                            onPress: async () => {
                                                try {
                                                    await signOut();
                                                } catch (e) {
                                                    // ignore
                                                }
                                                onClose();
                                                router.replace('/');
                                                Alert.alert('已登出', '您已成功登出。');
                                            },
                                        },
                                    ],
                                    { cancelable: true }
                                );
                            }}
                        >
                            <View style={styles.item}>
                                <Text style={[styles.itemText, { color: theme.colors.text }]}>登出。</Text>
                            </View>
                        </TouchableOpacity>
                    )}
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
    safeArea: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 16,
        gap: 12,
    },
    avatarSection: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    userInfoSection: {
        flex: 1,
        justifyContent: "center",
    },
    username: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    libraryInfo: {
        fontSize: 12,
    },
    loginButton: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    hint: {
        fontSize: 11,
    },
    line: {
        height: 1,
        width: 300,
        left: -36,
        marginVertical: 12,
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
