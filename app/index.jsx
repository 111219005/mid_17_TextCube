import * as SplashScreen from "expo-splash-screen";
import { StatusBar, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar.jsx";
import ImageUploadBox from "../components/ImageUploadBox.jsx";
import BackgroundImage from "../components/BackgroundImage.jsx";
import Drawer from "../components/Drawer.jsx";
import LatestEntries from "../components/LatestEntries.jsx";

SplashScreen.preventAutoHideAsync();

export default function Page() {

  const insets = useSafeAreaInsets();
  
  const [appIsReady, setAppIsReady] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <BackgroundImage>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.main}>
            <TopBar onMenuPress={() => setIsMenuOpen(true)} />
            <ImageUploadBox />
            <LatestEntries />
          </View>
          <Drawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </View>
      </BackgroundImage>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "yellow"
  },
  main: {
    height: "100%",
    justifyContent: "flex-start",
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: "red",
  },
});
