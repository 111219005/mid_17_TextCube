import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const Drawer = ({ isOpen, onClose }) => {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.drawer}>
                <Text style={styles.title}>TextCube</Text>
                <View style={styles.line} />

                <TouchableOpacity onPress={() => { router.push('/'); onClose(); }}>
                    <View style={[styles.item, { marginTop: 8 }]}>
                        <Text style={styles.itemText}>🏠 回到首頁</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { router.push('/text-libraries'); onClose(); }}>
                    <View style={styles.item}>
                        <Text style={styles.itemText}>📚 文字庫集</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { router.push('/add-text-library'); onClose(); }}>
                    <View style={styles.item}>
                        <Text style={styles.itemText}>➕ 新增文字庫</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { router.push('/settings'); onClose(); }}>
                    <View style={styles.item}>
                        <Text style={styles.itemText}>⚙️ 設定</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        elevation: 20,
        flexDirection: 'row',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    drawer: {
        width: 300,
        height: '100%',
        backgroundColor: 'white',
        paddingLeft: 16,
        elevation: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
    },
    line: {
        height: 1,
        backgroundColor: '#EDEDEF',
        width: 300,
        left: -16,
        marginTop: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
        paddingVertical: 16,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default Drawer;