import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import UserAvatarPreview from "./UserAvatarPreview";

export default function TopBar({ onMenuPress = () => {}, onLogoPress = () => {} }) {
  const { theme } = useTheme();
  const router = useRouter();
  const { isSignedIn } = useAuth();

  return (
    <View style={styles.topbar}>
      <TouchableOpacity 
        onPress={onMenuPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.icons}>
          <UserAvatarPreview showPreviewModal={true} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={onLogoPress} style={styles.icons} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        {theme.dark ? (
          <Image
            source={require("../assets/icon/logo_light/logo_light.png")}
            style={styles.logo}
          />
        ) : (
          <Image
            source={require("../assets/icon/logo/logo.png")}
            style={styles.logo}
          />
        )}
      </TouchableOpacity>

      <View style={styles.icons}>
        <Feather name="search" size={24} color={theme.colors.text} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    height: 68,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#727272",
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
  authContainer: {
    flex: 1,
    alignItems: "center",
  },
  authText: {
    fontSize: 14,
    fontWeight: "600",
  },
  hint: {
    fontSize: 10,
    marginTop: 2,
  },
});
