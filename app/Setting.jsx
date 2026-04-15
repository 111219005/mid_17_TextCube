import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextLibraries } from '../components/TextLibraryContext.jsx';

export default function Settings() {
    const [notifications, setNotifications] = useState(true);
    const { isDark, toggleTheme, theme } = useTheme();
    const { clearAllLibraries } = useTextLibraries();

    const viewDatabase = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const items = await AsyncStorage.multiGet(keys);
            console.log("=== 📦本地資料庫內容 ===");
            items.forEach(([key, value]) => {
                console.log(`\n🔑 Key: ${key}\n📄 Value:`, JSON.parse(value));
            });
            console.log("\n=============================");
            Alert.alert("成功", "已將資料庫內容印出在終端機。");
        } catch (error) {
            console.error("讀取資料庫失敗", error);
        }
    };

    const handleClearData = () => {
        Alert.alert(
            "警告",
            "確定要清除所有文字庫資料嗎？這項操作無法復原。",
            [
                { text: "取消", style: "cancel" },
                { text: "確定", style: "destructive", onPress: () => {
                    clearAllLibraries();
                    Alert.alert("完成", "已清空所有的文字庫資料！");
                }}
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.colors.text }]}>設定</Text>

            <View style={[styles.settingItem, { borderBottomColor: theme.dark ? '#333' : '#eee' }]}>
                <Text style={[styles.settingText, { color: theme.colors.text }]}>通知</Text>
                <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                />
            </View>

            <View style={[styles.settingItem, { borderBottomColor: theme.dark ? '#333' : '#eee' }]}>
                <Text style={[styles.settingText, { color: theme.colors.text }]}>深色模式</Text>
                <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                />
            </View>

            <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={viewDatabase}>
                <Text style={styles.buttonText}>列印資料庫內容 (開發者工具)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={handleClearData}>
                <Text style={styles.buttonText}>清除所有資料</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.buttonText}>關於</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    settingText: {
        fontSize: 16,
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});