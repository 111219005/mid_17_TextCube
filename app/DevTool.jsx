import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextLibraries } from '../components/TextLibraryContext.jsx';

export default function DevTool() {
    const { theme } = useTheme();
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
                {
                    text: "確定", style: "destructive", onPress: () => {
                        clearAllLibraries();
                        Alert.alert("完成", "已清空所有的文字庫資料！");
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { borderTopColor: theme.dark ? '#eee' : '#666' }]}>
            <TouchableOpacity style={[styles.settingItem, { borderColor: theme.dark ? '#eee' : '#666' }]} onPress={viewDatabase}>
                <Text style={[styles.settingText, { color: theme.colors.text }]}>列印資料庫內容。</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingItem, { borderColor: theme.dark ? '#eee' : '#666' }]} onPress={handleClearData}>
                <Text style={[styles.settingText, { color: theme.colors.text }]}>清除所有資料。</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: "visible",
        flex: 1,
        gap: 10,
        paddingHorizontal: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        // backgroundColor: "lightblue"
    },
    settingItem: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderWidth: 1,
        // backgroundColor: "lightgreen"
    },
    settingText: {
        fontSize: 16,
    },
})
