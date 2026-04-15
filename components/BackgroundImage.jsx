import { ImageBackground, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function BackgroundImage({ children }) {
    const { theme } = useTheme();

    return (
        <ImageBackground
            source={require("../assets/image/background.png")}
            style={[styles.image, { backgroundColor: theme.colors.background }]}
            resizeMode="cover"
        >
            {children}
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    image: {
        flex: 1,
    }
});
