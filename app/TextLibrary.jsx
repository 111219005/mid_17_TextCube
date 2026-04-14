import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useTextLibraries } from "../components/TextLibraryContext.jsx";

const DEFAULT_IMAGE = require("../assets/image/sakura.jpg");

export default function TextLibraries() {
  const router = useRouter();
  const { libraries } = useTextLibraries();
  

  return (      
      <View style={[styles.container]}>
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Text Libraries</Text>
              <Text style={styles.description}>
                Each library keeps its banner, sections, and text. Tap a card to edit it.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/AddTextLibrary")}
            >
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.addButtonText}>New</Text>
            </TouchableOpacity>
          </View>

          {libraries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No libraries yet</Text>
              <Text style={styles.emptyDescription}>
                Create your first library and it will show up here with its banner and preview.
              </Text>
            </View>
          ) : (
            libraries.map((library) => (
              <TouchableOpacity
                key={library.id}
                style={styles.card}
                onPress={() => router.push(`/AddTextLibrary?id=${library.id}`)}
              >
                <Image
                  source={library.bannerUri ? { uri: library.bannerUri } : DEFAULT_IMAGE}
                  style={styles.cardImage}
                />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{library.title}</Text>
                  <Text style={styles.cardMeta}>
                    {library.categories.length} sections / {library.entries.length} entries
                  </Text>
                  <Text numberOfLines={2} style={styles.cardPreview}>
                    {library.entries[0]?.text ?? "Open this library to add your first entry."}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {    
    width: "100%",
    height: "100%",
    // backgroundColor: "#ff000080",
  },
  content: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1b3147",
    marginBottom: 6,
  },
  description: {
    color: "#667787",
    lineHeight: 22,
    maxWidth: 240,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1d496f",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  emptyCard: {
    backgroundColor: "#fffaf4",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e5d7c7",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#24384c",
    marginBottom: 8,
  },
  emptyDescription: {
    color: "#6d7a86",
    lineHeight: 22,
  },
  card: {
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "#fffaf4",
    borderWidth: 1,
    borderColor: "#e5d7c7",
    marginBottom: 16,
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  cardBody: {
    padding: 18,
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1b3147",
    marginBottom: 6,
  },
  cardMeta: {
    color: "#a06034",
    fontWeight: "700",
    marginBottom: 10,
  },
  cardPreview: {
    color: "#667787",
    lineHeight: 22,
  },
});
