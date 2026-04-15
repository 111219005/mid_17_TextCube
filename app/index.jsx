import * as SplashScreen from "expo-splash-screen";
import { StatusBar, StyleSheet, View, TouchableOpacity, Text, Image, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import ImageUploadBox from "../components/ImageUploadBox.jsx";
import { useRouter } from "expo-router";
import { useTextLibraries } from "../components/TextLibraryContext.jsx";
import { useTheme } from "../context/ThemeContext";
import * as Clipboard from 'expo-clipboard';

SplashScreen.preventAutoHideAsync();

export default function Page() {

  const router = useRouter();
  const { recentEntries } = useTextLibraries();
  const latestEntries = recentEntries.slice(0, 6).reverse();
  const { theme } = useTheme();
  
  const [appIsReady, setAppIsReady] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <View style={styles.container}>
        <View style={styles.main}>
          <ImageUploadBox />
          <View style={styles.lastEntriesContainer}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.feedSection}>
                <View style={styles.stackArea}>
                  {latestEntries.map((entry, index) => {
                    const offset = (latestEntries.length - index - 1) * 18;
                    return (
                      <TouchableOpacity
                      key={`${entry.libraryId}-${entry.id}`}
                        style={[
                          styles.stackCard,
                          {
                            marginTop: index === 0 ? 0 : 18,
                            transform: [{ translateY: offset }],
                          },
                        ]}
                      onPress={() => handleCopy(entry.text)}
                      >
                        <Text style={[styles.stackText, { color: theme.colors.text }]}>{entry.text}</Text>
                      </TouchableOpacity>
                    );
                  })
                  }
                </View>
              </View>
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
    // backgroundColor: "#00FF0080", 
  },
  scroll: {
    width: "77%",
    height: "65%",
    marginLeft: 32,
    marginTop: "42.3%",
    flexGrow: 0,
    flexDirection: "column-reverse",
    // backgroundColor: "#ff00ff80",
  },
  scrollContent: {
    // backgroundColor: "green",
  },
  feedSection: {
    
    // backgroundColor: "#0000ff80",
  },
  stackArea: {
    gap: 10,
  },
  stackCard: {
    paddingVertical: 5,
    // backgroundColor: "#00ff0080",
  },
  stackText: {
    fontSize: 18,
    lineHeight: 26,
    color: "#24384c",
  },
  stackImage: {
    width: "100%",
    height: 120,
    borderRadius: 18,
    marginTop: 14,
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
