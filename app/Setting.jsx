import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
    const [notifications, setNotifications] = useState(true);
    const { isDark, toggleTheme, theme } = useTheme();

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

            <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]}>
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