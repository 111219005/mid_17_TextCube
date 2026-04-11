import * as SplashScreen from "expo-splash-screen";
import { StyleSheet, View, StatusBar } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar.jsx";
import ImageUploadBox from "../components/ImageUploadBox.jsx";
import BackgroundImage from "../components/BackgroundImage.jsx";
import Drawer from "../components/Drawer.jsx";

SplashScreen.preventAutoHideAsync();

function HomeContent() {
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
    <BackgroundImage>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.main}>
            <TopBar onMenuPress={() => setIsMenuOpen(true)} />
          <ImageUploadBox />
        </View>
        <Drawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </View>
    </BackgroundImage>
  );
}

export default function Page() {
  return (
    <SafeAreaProvider>
      <HomeContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 10,
    paddingHorizontal: 16,
  },
});
