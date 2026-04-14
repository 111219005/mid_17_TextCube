import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTextLibraries } from "../components/TextLibraryContext.jsx";

const DEFAULT_IMAGE = require("../assets/image/sakura.jpg");

function createDraftId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AddTextLibrary() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getLibraryById, saveLibrary } = useTextLibraries();
  const editingLibrary = typeof id === "string" ? getLibraryById(id) : null;
  const [bannerUri, setBannerUri] = useState(null);
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([
    { id: createDraftId("category"), name: "Uncategorized" },
  ]);
  const [entries, setEntries] = useState([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [entryInput, setEntryInput] = useState("");
  const [modalCategoryId, setModalCategoryId] = useState(null);
  const [modalCategoryInput, setModalCategoryInput] = useState("");

  useEffect(() => {
    if (!editingLibrary) {
      return;
    }

    setBannerUri(editingLibrary.bannerUri);
    setTitle(editingLibrary.title);
    setCategories(
      editingLibrary.categories.length > 0
        ? editingLibrary.categories
        : [{ id: createDraftId("category"), name: "Uncategorized" }]
    );
    setEntries(editingLibrary.entries);
  }, [editingLibrary]);

  useEffect(() => {
    if (!modalCategoryId && categories[0]?.id) {
      setModalCategoryId(categories[0].id);
    }
  }, [categories, modalCategoryId]);

  const groupedEntries = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        items: entries.filter((entry) => entry.categoryId === category.id),
      })),
    [categories, entries]
  );

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access so the banner image can be changed."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setBannerUri(result.assets[0].uri);
    }
  };

  const addCategory = (name, { fromModal = false } = {}) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return null;
    }

    const duplicate = categories.find((category) => category.name === trimmedName);
    if (duplicate) {
      if (fromModal) {
        setModalCategoryId(duplicate.id);
        setModalCategoryInput("");
      } else {
        setCategoryInput("");
      }
      return duplicate.id;
    }

    const nextCategory = {
      id: createDraftId("category"),
      name: trimmedName,
    };

    setCategories((currentCategories) => [...currentCategories, nextCategory]);
    setModalCategoryId(nextCategory.id);
    setCategoryInput("");
    setModalCategoryInput("");
    return nextCategory.id;
  };

  const handleAddEntries = () => {
    const lines = entryInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      Alert.alert("No text yet", "Add at least one word or sentence first.");
      return;
    }

    const nextCategoryId = modalCategoryId ?? categories[0]?.id ?? null;

    setEntries((currentEntries) => [
      ...currentEntries,
      ...lines.map((text) => ({
        id: createDraftId("entry"),
        text,
        categoryId: nextCategoryId,
        createdAt: Date.now(),
      })),
    ]);

    setEntryInput("");
    setModalVisible(false);
  };

  const handleSave = () => {
    const nextLibraryId = saveLibrary({
      id: editingLibrary?.id,
      createdAt: editingLibrary?.createdAt,
      title,
      bannerUri,
      categories,
      entries,
    });

    router.replace(`/AddTextLibrary?id=${nextLibraryId}`);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bannerCard}>
          <Image
            source={bannerUri ? { uri: bannerUri } : DEFAULT_IMAGE}
            style={styles.banner}
          />
          <TouchableOpacity style={styles.bannerAction} onPress={pickImage}>
            <Feather name="image" size={16} color="#17324d" />
            <Text style={styles.bannerActionText}>Change Banner</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Library Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter library title"
            placeholderTextColor="#7f8b96"
            style={styles.titleInput}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Section Titles</Text>
          <View style={styles.categoryRow}>
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{category.name}</Text>
              </View>
            ))}
          </View>
          <View style={styles.addCategoryRow}>
            <TextInput
              value={categoryInput}
              onChangeText={setCategoryInput}
              placeholder="Add a section title"
              placeholderTextColor="#7f8b96"
              style={styles.categoryInput}
            />
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={() => addCategory(categoryInput)}
            >
              <Text style={styles.addCategoryButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionLabel}>Entries</Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Feather name="save" size={16} color="#fff" />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          {entries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No entries yet</Text>
              <Text style={styles.emptyDescription}>
                Tap the plus button to add multiple words or sentences at once.
              </Text>
            </View>
          ) : (
            groupedEntries.map((group) => (
              <View key={group.id} style={styles.groupCard}>
                <Text style={styles.groupTitle}>{group.name}</Text>
                {group.items.length === 0 ? (
                  <Text style={styles.groupEmptyText}>
                    This section does not have any text yet.
                  </Text>
                ) : (
                  group.items.map((item) => (
                    <View key={item.id} style={styles.entryRow}>
                      <Text style={styles.entryBullet}>-</Text>
                      <Text style={styles.entryText}>{item.text}</Text>
                    </View>
                  ))
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => { }}>
            <Text style={styles.modalTitle}>Add Text</Text>
            <Text style={styles.modalHint}>
              Put one item on each line. It can be a single word or a sentence.
            </Text>

            <TextInput
              value={entryInput}
              onChangeText={setEntryInput}
              placeholder={"Example:\nToday is sunny.\nGood morning"}
              placeholderTextColor="#7f8b96"
              multiline
              textAlignVertical="top"
              style={styles.modalTextarea}
            />

            <Text style={styles.modalSectionLabel}>Choose Section</Text>
            <View style={styles.categoryRow}>
              {categories.map((category) => {
                const selected = modalCategoryId === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.modalCategoryChip,
                      selected && styles.modalCategoryChipActive,
                    ]}
                    onPress={() => setModalCategoryId(category.id)}
                  >
                    <Text
                      style={[
                        styles.modalCategoryChipText,
                        selected && styles.modalCategoryChipTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.addCategoryRow}>
              <TextInput
                value={modalCategoryInput}
                onChangeText={setModalCategoryInput}
                placeholder="Add a new section here"
                placeholderTextColor="#7f8b96"
                style={styles.categoryInput}
              />
              <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={() => addCategory(modalCategoryInput, { fromModal: true })}
              >
                <Text style={styles.addCategoryButtonText}>Add Section</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalGhostButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalGhostButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleAddEntries}
              >
                <Text style={styles.modalPrimaryButtonText}>Add Items</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 120,
  },
  bannerCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#d7e4ef",
    marginBottom: 24,
  },
  banner: {
    width: "100%",
    height: 200,
  },
  bannerAction: {
    position: "absolute",
    right: 16,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  bannerActionText: {
    color: "#17324d",
    fontWeight: "700",
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1b3147",
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: "#fffdf9",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d8c9b8",
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
    color: "#24384c",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryChip: {
    backgroundColor: "#2f5f88",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  categoryChipText: {
    color: "#fff",
    fontWeight: "700",
  },
  addCategoryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  categoryInput: {
    flex: 1,
    backgroundColor: "#fffdf9",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d8c9b8",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#24384c",
  },
  addCategoryButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c67e4e",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  addCategoryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1d496f",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#fffaf4",
    borderWidth: 1,
    borderColor: "#e5d7c7",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#24384c",
    marginBottom: 8,
  },
  emptyDescription: {
    color: "#6d7a86",
    lineHeight: 22,
  },
  groupCard: {
    backgroundColor: "#fffaf4",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5d7c7",
  },
  groupTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#17324d",
    marginBottom: 10,
  },
  groupEmptyText: {
    color: "#7f8b96",
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  entryBullet: {
    marginRight: 8,
    color: "#c67e4e",
    fontSize: 18,
    lineHeight: 22,
  },
  entryText: {
    flex: 1,
    color: "#314457",
    lineHeight: 22,
  },
  floatingButton: {
    position: "absolute",
    right: 24,
    bottom: 28,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#d66b3d",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(16, 25, 35, 0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff9f0",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1b3147",
    marginBottom: 8,
  },
  modalHint: {
    color: "#6d7a86",
    lineHeight: 21,
    marginBottom: 16,
  },
  modalTextarea: {
    minHeight: 140,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d8c9b8",
    backgroundColor: "#fffdf9",
    padding: 14,
    color: "#24384c",
    marginBottom: 16,
  },
  modalSectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1b3147",
    marginBottom: 10,
  },
  modalCategoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#c8b39b",
    backgroundColor: "#fffdf9",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  modalCategoryChipActive: {
    backgroundColor: "#1d496f",
    borderColor: "#1d496f",
  },
  modalCategoryChipText: {
    color: "#36506a",
    fontWeight: "700",
  },
  modalCategoryChipTextActive: {
    color: "#fff",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  modalGhostButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#efe3d4",
  },
  modalGhostButtonText: {
    color: "#5b6e80",
    fontWeight: "700",
  },
  modalPrimaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#d66b3d",
  },
  modalPrimaryButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
});
