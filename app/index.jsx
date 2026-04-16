import * as SplashScreen from "expo-splash-screen";
import { StyleSheet, View, TouchableOpacity, Text, Image, ScrollView } from "react-native";
import { useEffect, useMemo, useState, useRef } from "react";
import ImageUploadBox from "../components/ImageUploadBox.jsx";
import { useRouter } from "expo-router";
import { useTextLibraries } from "../components/TextLibraryContext.jsx";
import { useTheme } from "../context/ThemeContext";
import * as Clipboard from 'expo-clipboard';

SplashScreen.preventAutoHideAsync();

export default function Page() {

  const router = useRouter();
  const { recentEntries } = useTextLibraries();
  const latestEntries = useMemo(() => recentEntries.slice(-20).reverse(), [recentEntries]);
  const { theme } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const scrollRef = useRef(null);

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

  const handleCopy = async (text) => {
    await Clipboard.setStringAsync(text);
    setToastMessage("已複製到剪貼簿！");
    setTimeout(() => {
      setToastMessage("");
    }, 2000);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.main}>
          <ImageUploadBox />
          <View style={styles.lastEntriesContainer}>
            <ScrollView
              ref={scrollRef}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                scrollRef.current?.scrollToEnd({ animated: true })
              }
            >
              {latestEntries.map((entry) => (
                <TouchableOpacity
                  key={`${entry.libraryId}-${entry.id}`}
                  style={styles.stackCard}
                  onPress={() => handleCopy(entry.text)}
                >
                  <Text style={[styles.stackText, { color: theme.colors.text }]}>{entry.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {toastMessage ? (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    // backgroundColor: "yellow"
  },
  main: {
    height: "100%",
    justifyContent: "flex-start",
    paddingTop: 10,
    paddingHorizontal: 16,
    // backgroundColor: "red",
  },
  lastEntriesContainer: {
    position: "absolute",
    zIndex: 0,
    width: "65%",
    height: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
    // backgroundColor: "#00FF0080", 
  },
  scroll: {
    width: "77%",
    maxHeight: "65%",
    marginLeft: 32,
    marginBottom: "25%",
    // backgroundColor: "#ff00ff80",
  },
  scrollContent: {
    flexDirection: "column",
    gap: 10,
  },
  stackCard: {
    // backgroundColor: "#00ff0080",
  },
  stackText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "500",
  },
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toastText: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
