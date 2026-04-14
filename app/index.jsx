import * as SplashScreen from "expo-splash-screen";
import { StatusBar, StyleSheet, View, TouchableOpacity, Text, Image, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import ImageUploadBox from "../components/ImageUploadBox.jsx";
import { useRouter } from "expo-router";
import { useTextLibraries } from "../components/TextLibraryContext.jsx";


SplashScreen.preventAutoHideAsync();

export default function Page() {

  const router = useRouter();
  const { recentEntries } = useTextLibraries();
  const latestEntries = recentEntries.slice(0, 6).reverse();

  const [appIsReady, setAppIsReady] = useState(false);

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
                        key={entry.id}
                        style={[
                          styles.stackCard,
                          {
                            marginTop: index === 0 ? 0 : -36,
                            transform: [{ translateY: offset }],
                          },
                        ]}
                        onPress={() => router.push(`/AddTextLibrary?id=${entry.libraryId}`)}
                      >
                        <View style={styles.stackCardHeader}>
                          <Text style={styles.stackCategory}>{entry.categoryName}</Text>
                        </View>
                        <Text style={styles.stackText}>{entry.text}</Text>
                        {entry.bannerUri ? (
                          <Image source={{ uri: entry.bannerUri }} style={styles.stackImage} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })
                  }
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "yellow"
  },
  main: {
    height: "100%",
    justifyContent: "flex-start",
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: "red",
  },
  lastEntriesContainer: {
    position: "absolute",
    zIndex: 0,
    width: "65%",
    height: "100%",
    // marginTop: "25%",
    // justifyContent: "center",
    alignItems: "flex-end",
    backgroundColor: "#00FF0080", 
  },
  scroll: {
    width: "80%",
    height: "65%",
    marginLeft: "5%",
    marginTop: "42.1%",
    flexGrow: 0,
    backgroundColor: "#ff00ff80",
  },
  scrollContent: {
    // backgroundColor: "green",
  },
  feedSection: {
    backgroundColor: "#0000ff80",
  },
  stackArea: {
    paddingBottom: 30,
  },
  stackCard: {
    borderRadius: 28,
    padding: 18,
  },
  stackCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stackCategory: {
    color: "#b4663b",
    fontWeight: "800",
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
});
