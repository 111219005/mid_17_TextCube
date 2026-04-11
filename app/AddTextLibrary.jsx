import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function AddTextLibrary() {
    const [libraryName, setLibraryName] = useState('');

    const handleCreate = () => {
        // TODO: 實現創建文字庫的邏輯
        console.log('創建文字庫:', libraryName);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>新增文字庫</Text>
            <TextInput
                style={styles.input}
                placeholder="輸入文字庫名稱"
                value={libraryName}
                onChangeText={setLibraryName}
            />
            <TouchableOpacity style={styles.button} onPress={handleCreate}>
                <Text style={styles.buttonText}>創建</Text>
            </TouchableOpacity>
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
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});