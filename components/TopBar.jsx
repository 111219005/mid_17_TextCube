import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";

export default function TopBar({ onMenuPress = () => {} }) {
  return (
    <View style={styles.topbar}>
      <View style={styles.titleArea}>
        <TouchableOpacity onPress={onMenuPress}>
          <View style={styles.icons}>
            <Feather name="menu" size={24} color="black" />
          </View>
        </TouchableOpacity>

        <View style={styles.icons}>
          <Image
            source={require("../assets/icon/logo/logo.png")}
            style={styles.logo}
          />
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
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 1,
  },
  titleArea: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icons: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 32,
    height: 32,
  },
  line: {
    height: 1,
    backgroundColor: "#727272",
    width: "100%",
    marginTop: 8,
  },
});
