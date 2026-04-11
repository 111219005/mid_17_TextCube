import { View, Text, StyleSheet } from 'react-native';

export default function TextLibraries() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>文字庫集</Text>
            <Text style={styles.description}>這裡將顯示您的文字庫列表</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});