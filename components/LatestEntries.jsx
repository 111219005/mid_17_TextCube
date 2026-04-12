import { StyleSheet, View, TouchableOpacity, Text, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTextLibraries } from "../components/TextLibraryContext.jsx";

export default function LatestEntries() {
    const router = useRouter();
    const { recentEntries } = useTextLibraries();
    const latestEntries = recentEntries.slice(0, 6).reverse();

    return (
            <View style={styles.container}>
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
                                            <Text style={styles.stackLibrary}>{entry.libraryTitle}</Text>
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
    )
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        zIndex: 5,
        width: "110%",
        height: "100%",
        justifyContent: "center",
        // backgroundColor: "white",
    },
    scroll: {
        width: "55%",
        height: "65%",
        marginLeft: "5%",
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
    stackLibrary: {
        color: "#6d7a86",
        fontWeight: "600",
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
})