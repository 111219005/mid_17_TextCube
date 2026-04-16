import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useTextLibraries } from "../components/TextLibraryContext.jsx";
import * as Clipboard from 'expo-clipboard';
import { useTheme } from "../context/ThemeContext";

const DEFAULT_IMAGE = require("../assets/image/sakura.jpg");

function createDraftId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AddTextLibrary() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const { getLibraryById, saveLibrary } = useTextLibraries();
  const editingLibrary = typeof id === "string" ? getLibraryById(id) : null;
  const [currentLibraryId, setCurrentLibraryId] = useState(typeof id === "string" ? id : null);
  const currentLibraryIdRef = useRef(typeof id === "string" ? id : null);
  const isDataLoaded = useRef(false);
  const [bannerUri, setBannerUri] = useState(null);
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [entryInput, setEntryInput] = useState("");
  const [modalCategoryId, setModalCategoryId] = useState(null);
  const [modalCategoryInput, setModalCategoryInput] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isCategoryVisible, setIsCategoryVisible] = useState(false);
  const isMounted = useRef(false);
  const { theme } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    if (!editingLibrary || isDataLoaded.current) {
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
    setExpandedGroups(editingLibrary.expandedGroups || {});
    isDataLoaded.current = true;
  }, [editingLibrary]);

  useEffect(() => {
    if (!modalCategoryId && categories[0]?.id) {
      setModalCategoryId(categories[0].id);
    }
  }, [categories]);

  const groupedEntries = useMemo(() => {
    const noSectionItems = entries.filter((entry) => entry.categoryId === null);
    const categorizedGroups = categories.map((category) => ({
      ...category,
      items: entries.filter((entry) => entry.categoryId === category.id),
    }));

    // Put No Section first if it has items
    if (noSectionItems.length > 0) {
      return [
        {
          id: "no-section",
          name: "No Section",
          items: noSectionItems,
        },
        ...categorizedGroups,
      ];
    }

    return categorizedGroups;
  }, [categories, entries]);

  // Set default expanded state for new groups
  useEffect(() => {
    setExpandedGroups(prev => {
      const newExpanded = { ...prev };
      groupedEntries.forEach(group => {
        if (newExpanded[group.id] === undefined) {
          newExpanded[group.id] = true; // Default to expanded
        }
      });
      return newExpanded;
    });
  }, [groupedEntries]);

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

    let targetCategoryId = modalCategoryId;

    // If no category is selected and no categories exist, create a default one.
    // But if explicitly set to null (No Section), keep it as null.
    if (targetCategoryId === undefined && categories.length === 0) {
      const newCategory = { id: createDraftId("category"), name: "Uncategorized" };
      setCategories([newCategory]);
      targetCategoryId = newCategory.id;
    } else if (targetCategoryId === undefined) {
      // Default to the first category if one exists but none is selected
      targetCategoryId = categories[0]?.id ?? null;
    }
    // If targetCategoryId is explicitly null (No Section selected), keep it as null

    setEntries((currentEntries) => [
      ...currentEntries,
      ...lines.map((text) => ({
        id: createDraftId("entry"),
        text,
        categoryId: targetCategoryId,
        createdAt: Date.now(),
      })),
    ]);

    setEntryInput("");
    setModalVisible(false);
  };

  const showToast = (msg = "正在存檔...") => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2000);
  };

  const handleCopy = async (text) => {
    await Clipboard.setStringAsync(text);
    showToast("已複製到剪貼簿！");
  };

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      // Don't save if there's no title
      return;
    }
    showToast("正在存檔...");
    const savedId = saveLibrary({
      id: currentLibraryIdRef.current,
      createdAt: editingLibrary?.createdAt,
      title,
      bannerUri,
      categories,
      entries,
      expandedGroups,
    });

    if (savedId !== currentLibraryIdRef.current) {
      currentLibraryIdRef.current = savedId;
      setCurrentLibraryId(savedId);
      router.setParams({ id: savedId });
    }
  }, [editingLibrary, title, bannerUri, categories, entries, expandedGroups, saveLibrary, router]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return; // Don't run on initial mount
    }
    const timer = setTimeout(() => handleSave(), 5000); // 5-second delay
    return () => clearTimeout(timer);
  }, [title, bannerUri, categories, entries, handleSave]);

  // Save on back press
  useEffect(() => {
    const listener = navigation.addListener('beforeRemove', handleSave);
    return () => navigation.removeListener('beforeRemove', listener);
  }, [navigation, handleSave]);

  return (
    <View style={styles.screen}>
      <View style={styles.bannerCard}>
        <Image
          source={bannerUri ? { uri: bannerUri } : DEFAULT_IMAGE}
          style={styles.banner}
        />
        <TouchableOpacity style={styles.bannerAction} onPress={pickImage}>
          <Feather name="image" size={16} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="新增文字庫標題"
            style={styles.titleInput}
          />
          <TouchableOpacity style={styles.icon} onPress={() => setIsCategoryVisible(!isCategoryVisible)}>
            <Feather name="tag" size={32} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {isCategoryVisible && (
          <View style={styles.categorySection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryRow}
              contentContainerStyle={styles.categoryRowContent}
            >
              {categories.map((category) => (
                <View key={category.id} style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>{category.name}</Text>
                </View>
              ))}
            </ScrollView>
            {isAddingCategory ? (
              <View style={styles.addCategoryRow}>
                <TextInput
                  value={categoryInput}
                  onChangeText={setCategoryInput}
                  placeholder="請輸入段落標題"
                  placeholderTextColor="#7f8b96"
                  style={styles.categoryInput}
                  autoFocus
                  onBlur={() => setIsAddingCategory(false)}
                  onSubmitEditing={() => {
                    addCategory(categoryInput);
                    setIsAddingCategory(false);
                  }}
                />
              </View>
            ) : (
              <TouchableOpacity style={styles.addCategoryPrompt} onPress={() => setIsAddingCategory(true)}>
                <Feather name="plus-circle" size={16} color="#7f8b96" />
                <Text style={styles.addCategoryPromptText}>請輸入段落標題</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.section}>
          {/* Save button is removed for autosave */}

          {entries.length === 0 ? null : (
            groupedEntries.map((group) => (
              <View key={group.id} style={[styles.groupCard, { backgroundColor: group.id === "no-section" ? "transparent" : theme.colors.card, borderColor: group.id === "no-section" ? "transparent" : theme.colors.borderColor, borderWidth: group.id === "no-section" ? 0 : 1 }]}>
                {group.id !== "no-section" && (
                  <View style={styles.groupTitleContainer}>
                    <Text style={[styles.groupTitle, { color: theme.colors.text }]}>{group.name}</Text>
                    <View style={styles.groupTitleiconRow}>
                      <TouchableOpacity style={styles.groupTitleicon}>
                        <Feather name="more-horizontal" size={24} color={theme.colors.text} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.groupTitleicon} onPress={() => {
                        setExpandedGroups(prev => ({ ...prev, [group.id]: !prev[group.id] }));
                      }}>
                        <Feather name={expandedGroups[group.id] ? "chevron-up" : "chevron-down"} size={24} color={theme.colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {group.items.length === 0 ? null : (
                  expandedGroups[group.id] && (
                    <View style={group.id === "no-section" ? styles.noSectionContainer : {}}>
                      {group.items.map((item) => (
                        <TouchableOpacity key={item.id} style={[styles.entryButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderColor }]} onPress={() => handleCopy(item.text)}>
                          <Text style={[styles.entryButtonText, { color: theme.colors.text }]}>
                            {item.text}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          setModalCategoryId(null);
          setModalVisible(true);
        }}
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
              <TouchableOpacity
                style={[
                  styles.modalCategoryChip,
                  modalCategoryId === null && styles.modalCategoryChipActive,
                ]}
                onPress={() => setModalCategoryId(null)}
              >
                <Text
                  style={[
                    styles.modalCategoryChipText,
                    modalCategoryId === null && styles.modalCategoryChipTextActive,
                  ]}
                >
                  No Section
                </Text>
              </TouchableOpacity>
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

      {toastMessage ? (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    // backgroundColor: "orange",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Make space for floating button
    // backgroundColor: "lightblue",
  },
  bannerCard: {
    width: "100%",
    height: "15%",
    // marginBottom: 24,
    // backgroundColor: "lightgreen",
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  bannerAction: {
    position: "absolute",
    right: 16,
    bottom: 16,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  titleSection: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // backgroundColor: "red",
  },
  titleInput: {
    width: "80%",
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
    backgroundColor: "white",
  },
  icon: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "pink",
  },
  categorySection: {
    marginTop: 10,
    backgroundColor: "yellow",
  },
  categoryRow: {
    flexDirection: "row",
  },
  categoryRowContent: {
    gap: 10,
    paddingVertical: 5,
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
  addCategoryPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 12,
    backgroundColor: '#fffdf9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d8c9b8',
  },
  addCategoryPromptText: {
    color: '#967f7f',
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
  groupCard: {
    paddingTop: 10,
    paddingHorizontal: 13,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  noSectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  groupTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    // backgroundColor: "green",
  },
  groupTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  groupTitleicon: {
    width: 32,
    height: 32,
  },
  groupTitleiconRow: {
    flexDirection: "row",
    gap: 5,
  },
  entryButton: {
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  entryButtonText: {
    flex: 1,
    lineHeight: 22,
  },
  floatingButton: {
    position: "absolute",
    right: 24,
    bottom: 28,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
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
