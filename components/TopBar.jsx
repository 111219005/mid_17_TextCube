import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import Feather from '@expo/vector-icons/Feather';

export default function TopBar({ onMenuPress = () => { } }) {
    return (
        <View style={styles.topbar}>
            <View style={styles.titleArea}>
                <TouchableOpacity onPress={onMenuPress}>
                    <View style={styles.icons}>
                        <Feather name="menu" size={24} color="black" />
                    </View>
                </TouchableOpacity>
                <View style={styles.icons}>
                    <Image source={require("../assets/icon/logo/logo.png")} style={{ width: 32, height: 32 }} />
                </View>
                <View style={styles.icons}>
                    <Feather name="search" size={24} color="black" />
                </View>
            </View>
            <View style={styles.line} />
        </View>
    );
}

const styles = StyleSheet.create({
    topbar: {
        height: "auto",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        zIndex: 1,
        // backgroundColor: "green",
    },
    titleArea: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // backgroundColor: "blue",
    },
    icons: {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "pink",
    },
    line: {
        height: 1,
        backgroundColor: "#727272",
        width: "100%",
        marginTop: 8,
        zIndex: -2,
    }
});