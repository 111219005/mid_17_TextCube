import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from "expo-router";
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Settings() {
    const [notifications, setNotifications] = useState(true);
    const { isDark, toggleTheme, theme } = useTheme();
    const router = useRouter();

    return (
        <View style={[styles.container, { borderTopColor: theme.dark ? '#eee' : '#666' }]}>

            <View style={[styles.settingItem, { borderColor: theme.dark ? '#eee' : '#666' }]}>
                <Text style={[styles.settingText, { color: theme.colors.text }]}>深色模式。</Text>
                <Switch
                    trackColor={{ false: "#d1d1d1", true: theme.colors.primary }}
                    thumbColor={isDark ? "#666" : "#f0f0f0"}
                    value={isDark}
                    onValueChange={toggleTheme}
                />
            </View>

            <TouchableOpacity style={[styles.settingItem, { borderColor: theme.dark ? '#eee' : '#666' }]}>
                <Text style={[styles.settingText, { color: theme.colors.text }]}>文字方塊雲端同步。</Text>
                <Ionicons name="chevron-back-outline" size={24} color={theme.colors.text} style={{ transform: [{ scaleX: -1 }] }} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingItem, { borderColor: theme.dark ? '#eee' : '#666' }]} onPress={() => { router.push("/DevTool") }}>
                <Text style={[styles.settingText, { color: theme.colors.text }]}>開發者工具。</Text>
                <Ionicons name="chevron-back-outline" size={24} color={theme.colors.text} style={{ transform: [{ scaleX: -1 }] }} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingItem, { borderColor: theme.dark ? '#eee' : '#666' }]}>
                <Text style={[styles.settingText, { color: theme.colors.text }]}>關於。</Text>
                <Ionicons name="chevron-back-outline" size={24} color={theme.colors.text} style={{ transform: [{ scaleX: -1 }] }} />
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