import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Image, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useTextLibraries } from "../components/TextLibraryContext.jsx";
import * as Clipboard from 'expo-clipboard';
import { useTheme } from "../context/ThemeContext";

const DEFAULT_IMAGE = require("../assets/image/sakura.jpg");

function createDraftId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const DraggableEntry = ({ item, theme, handleCopy, onDrop, scrollOffset, setScrollEnabled }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const isDraggingRef = useRef(false);
  const longPressTimer = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => isDraggingRef.current,
      onPanResponderTerminationRequest: () => !isDraggingRef.current, // 允許 ScrollView 在一般滑動時搶走觸控

      onPanResponderGrant: (e, gestureState) => {
        setIsPressed(true);
        longPressTimer.current = setTimeout(() => {
          isDraggingRef.current = true;
          setIsDragging(true);
          setScrollEnabled(false); // 鎖定背景滾動
        }, 400); // 400 毫秒視為長按
      },
      onPanResponderMove: (e, gestureState) => {
        if (isDraggingRef.current) {
          pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        } else {
          // 如果還沒達到長按時間就開始大範圍滑動，代表使用者是在滾動畫面，取消長按判定
          if (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10) {
            clearTimeout(longPressTimer.current);
          }
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        clearTimeout(longPressTimer.current);
        setIsPressed(false);
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          setIsDragging(false);
          setScrollEnabled(true);
          onDrop(item, gestureState); // 觸發放置邏輯
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        } else {
          // 短按判定 (點擊)
          if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
            handleCopy(item.text);
          }
        }
      },
      onPanResponderTerminate: (e, gestureState) => {
        clearTimeout(longPressTimer.current);
        setIsPressed(false);
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          setIsDragging(false);
          setScrollEnabled(true);
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      }
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.entryButton,
        { backgroundColor: isPressed ? theme.colors.primary : theme.colors.card, borderColor: theme.colors.text },
        isDragging && {
          transform: pan.getTranslateTransform(),
          zIndex: 999,
          opacity: 0.8,
          elevation: 5,
          shadowColor: theme.colors.text,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }
      ]}
    >
      <Text style={[styles.entryButtonText, { color: theme.colors.text }]}>
        {item.text}
      </Text>
    </Animated.View>
  );
};

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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategoryTitle, setEditingCategoryTitle] = useState("");
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [deletecategoryModalVisible, setDeleteCategoryModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isCategoryVisible, setIsCategoryVisible] = useState(false);
  const scrollViewRef = useRef(null);
  const sectionLayouts = useRef({});
  const [isAddingModalCategory, setIsAddingModalCategory] = useState(false);
  const isMounted = useRef(false);
  const { theme } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState({});
  const skipNextAutoSave = useRef(typeof id === "string");
  const handleSaveRef = useRef(null);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const scrollViewLayout = useRef({ y: 0, height: 0 });
  const scrollOffset = useRef(0);

  useEffect(() => {
    if (!editingLibrary || isDataLoaded.current) {
      return;
    }

    setBannerUri(editingLibrary.bannerUri);
    setTitle(editingLibrary.title);
    setCategories(
      editingLibrary.categories.length > 0
        ? editingLibrary.categories
        : (editingLibrary.entries.some(entry => entry.categoryId !== null)
          ? [{ id: createDraftId("category"), name: "Uncategorized" }]
          : [])
    );
    setEntries(editingLibrary.entries);
    setExpandedGroups(editingLibrary.expandedGroups || {});
    isDataLoaded.current = true;
    skipNextAutoSave.current = true;
  }, [editingLibrary]);

  useEffect(() => {
    if (modalCategoryId === undefined && categories.length > 0) {
      setModalCategoryId(categories[0].id);
    }
  }, [categories, modalCategoryId]);

  const groupedEntries = useMemo(() => {
    const noSectionItems = entries.filter((entry) => entry.categoryId === null);
    const categorizedGroups = categories.map((category) => ({
      ...category,
      items: entries.filter((entry) => entry.categoryId === category.id),
    }));

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

  const handleDrop = useCallback((item, gestureState) => {
    // 計算放開時的手指位置相對於 ScrollView 內容區塊的絕對座標
    const absoluteDropY = gestureState.moveY - scrollViewLayout.current.y + scrollOffset.current;
    
    let closestId = item.categoryId;
    let minDistance = Infinity;

    for (const [id, layout] of Object.entries(sectionLayouts.current)) {
      if (!layout) continue;

      // 優先判斷是否落在該 section 的範圍內
      if (absoluteDropY >= layout.y && absoluteDropY <= layout.y + layout.height) {
        closestId = id === "no-section" ? null : id;
        break;
      }

      // 備案：如果落在縫隙中，則找尋中心點最近的 section
      const sectionCenter = layout.y + (layout.height / 2);
      const dist = Math.abs(absoluteDropY - sectionCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestId = id === "no-section" ? null : id;
      }
    }

    if (closestId !== item.categoryId) {
      setEntries(prev => prev.map(e => e.id === item.id ? { ...e, categoryId: closestId } : e));
      setExpandedGroups(prev => ({ ...prev, [closestId === null ? "no-section" : closestId]: true }));
      showToast("已移動至新段落");
    }
  }, []);

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

    if (targetCategoryId === undefined && categories.length === 0) {
      const newCategory = { id: createDraftId("category"), name: "Uncategorized" };
      setCategories([newCategory]);
      targetCategoryId = newCategory.id;
    } else if (targetCategoryId === undefined) {
      targetCategoryId = categories[0]?.id ?? null;
    }

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

  const showToast = (msg = "存檔中") => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2000);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setEditingCategoryTitle(category.name);
    setCategoryModalVisible(true);
  };

  const handleSaveCategory = () => {
    if (selectedCategory && editingCategoryTitle.trim()) {
      setCategories(prevCategories =>
        prevCategories.map(cat =>
          cat.id === selectedCategory.id
            ? { ...cat, name: editingCategoryTitle.trim() }
            : cat
        )
      );
      setCategoryModalVisible(false);
      setSelectedCategory(null);
      setEditingCategoryTitle("");
    }
  };

  const executeDeleteCategory = (deleteEntries) => {
    if (deleteEntries) {
      setEntries(prevEntries =>
        prevEntries.filter(entry => entry.categoryId !== selectedCategory.id)
      );
    } else {
      setEntries(prevEntries =>
        prevEntries.map(entry =>
          entry.categoryId === selectedCategory.id
            ? { ...entry, categoryId: null }
            : entry
        )
      );
    }
    setCategories(prevCategories =>
      prevCategories.filter(cat => cat.id !== selectedCategory.id)
    );
    setExpandedGroups(prev => {
      const newExpanded = { ...prev };
      delete newExpanded[selectedCategory.id];
      return newExpanded;
    });
    setCategoryModalVisible(false);
    setSelectedCategory(null);
    setEditingCategoryTitle("");
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    Alert.alert(
      "刪除段落標題",
      "請問是否要連同該段落內的「文字方塊」一併刪除？\n\n若選擇「保留文字」，這些文字方塊將會被移至未分類區塊。",
      [
        { text: "取消", style: "cancel" },
        { text: "保留文字", onPress: () => executeDeleteCategory(false) },
        { text: "一併刪除", style: "destructive", onPress: () => executeDeleteCategory(true) }
      ]
    );
  };

  const handleCopy = async (text) => {
    await Clipboard.setStringAsync(text);
    showToast("已複製到剪貼簿");
  };

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      return;
    }
    showToast("存檔中");
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

  // 隨時保持 handleSaveRef 是最新的函式，這樣就不會因為函式重建而觸發 useEffect
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    // 阻擋初次載入資料時觸發的自動存檔
    if (skipNextAutoSave.current) {
      skipNextAutoSave.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (handleSaveRef.current) handleSaveRef.current();
    }, 5000);
    return () => clearTimeout(timer);
  }, [title, bannerUri, categories, entries, expandedGroups]);

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
        <View style={styles.bannerOverlay} />
        <TouchableOpacity style={styles.bannerAction} onPress={pickImage}>
          <Feather name="image" size={16} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={isScrollEnabled}
        scrollEventThrottle={16}
        onScroll={(e) => { scrollOffset.current = e.nativeEvent.contentOffset.y; }}
        onLayout={(e) => { scrollViewLayout.current = e.nativeEvent.layout; }}
      >
        <View style={styles.titleSection}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="新增文字庫標題"
            placeholderTextColor={theme.dark ? "#888" : "#c4c4c4"}
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
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryChip, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]}
                  onPress={() => {
                    const layout = sectionLayouts.current[category.id];
                    if (layout && layout.y !== undefined) {
                      scrollViewRef.current?.scrollTo({ y: Math.max(0, layout.y - 20), animated: true });
                    }
                  }}
                >
                  <Text style={[styles.categoryChipText, { color: theme.colors.text }]}>{category.name}</Text>
                </TouchableOpacity>
              ))}
              {categories.length > 0 && !isAddingCategory && (
                <TouchableOpacity style={styles.addIconBtn} onPress={() => setIsAddingCategory(true)}>
                  <MaterialIcons name="playlist-add" size={28} color={theme.colors.text} />
                </TouchableOpacity>
              )}
            </ScrollView>
            {(categories.length === 0 || isAddingCategory) && (
              <View style={styles.addCategoryRow}>
                <TextInput
                  value={categoryInput}
                  onChangeText={setCategoryInput}
                  placeholder="請輸入段落標題"
                  placeholderTextColor={theme.dark ? "#888" : "#7f8b96"}
                  style={[styles.categoryInput, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderColor, color: theme.colors.text }]}
                  autoFocus={isAddingCategory}
                />
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={() => {
                    addCategory(categoryInput);
                    setIsAddingCategory(false);
                  }}
                >
                  <Feather name="check" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={[styles.line, { backgroundColor: theme.colors.text }]} />

        <View style={styles.section}>
          {entries.length === 0 ? null : (
            groupedEntries.map((group) => (
              <View
                key={group.id}
                onLayout={(e) => { sectionLayouts.current[group.id] = { y: e.nativeEvent.layout.y, height: e.nativeEvent.layout.height }; }}
                style={[styles.groupCard, { left: group.id === "no-section" ? -13 : undefined, backgroundColor: group.id === "no-section" ? "transparent" : theme.colors.card, borderColor: group.id === "no-section" ? "transparent" : theme.colors.borderColor, borderWidth: group.id === "no-section" ? 0 : 1 }]}
              >
                {group.id !== "no-section" && (
                  <View style={styles.groupTitleContainer}>
                    <Text style={[styles.groupTitle, { color: theme.colors.text }]}>{group.name}</Text>
                    <View style={styles.groupTitleiconRow}>
                      <TouchableOpacity style={styles.groupTitleicon} onPress={() => handleEditCategory(group)}>
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
                    <View style={group.id === "no-section" ? styles.noSectionContainer : styles.categoryContainer}>
                      {group.items.map((item) => (
                        <DraggableEntry
                          key={item.id}
                          item={item}
                          theme={theme}
                          handleCopy={handleCopy}
                          onDrop={handleDrop}
                          scrollOffset={scrollOffset}
                          setScrollEnabled={setIsScrollEnabled}
                        />
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
        style={[styles.floatingButton, { backgroundColor: theme.colors.text }]}
        onPress={() => {
          setModalCategoryId(null);
          setModalVisible(true);
        }}
      >
        <Feather name="plus" size={28} color={theme.colors.background} />
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={[styles.modalCard, { backgroundColor: theme.colors.card }]} onPress={() => { }}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>新增文字方塊。</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryRow}
              contentContainerStyle={styles.categoryRowContent}
            >
              <TouchableOpacity
                style={[
                  styles.modalCategoryChip,
                  modalCategoryId === null
                    ? { backgroundColor: theme.colors.text, borderColor: theme.colors.text }
                    : { backgroundColor: theme.colors.card, borderColor: theme.colors.text }
                ]}
                onPress={() => setModalCategoryId(null)}
              >
                <Text
                  style={[
                    modalCategoryId === null ? { color: theme.colors.background } : { color: theme.colors.text }
                  ]}
                >
                  未分類
                </Text>
              </TouchableOpacity>
              {categories.map((category) => {
                const selected = modalCategoryId === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.modalCategoryChip,
                      selected
                        ? { backgroundColor: theme.colors.text, borderColor: theme.colors.text }
                        : { backgroundColor: theme.colors.card, borderColor: theme.colors.text }
                    ]}
                    onPress={() => setModalCategoryId(category.id)}
                  >
                    <Text
                      style={[
                        { fontWeight: "500"},
                        selected ? { color: theme.colors.background } : { color: theme.colors.text }
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {!isAddingModalCategory && (
                <TouchableOpacity style={styles.addIconBtn} onPress={() => setIsAddingModalCategory(true)}>
                  <MaterialIcons name="playlist-add" size={28} color={theme.colors.text} />
                </TouchableOpacity>
              )}
            </ScrollView>

            {isAddingModalCategory && (
              <View style={styles.addCategoryRow}>
                <TextInput
                  value={modalCategoryInput}
                  onChangeText={setModalCategoryInput}
                  placeholder="請輸入段落標題"
                  placeholderTextColor={theme.dark ? "#888" : "#7f8b96"}
                  style={[styles.categoryInput, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderColor, color: theme.colors.text }]}
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.checkButton,]}
                  onPress={() => {
                    addCategory(modalCategoryInput, { fromModal: true });
                    setIsAddingModalCategory(false);
                  }}
                >
                  <Feather name="check" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            )}

            <TextInput
              value={entryInput}
              onChangeText={setEntryInput}
              placeholder={"例：\n生命是一襲華美的蝨子，爬滿了袍。"}
              placeholderTextColor={theme.dark ? "#888" : "#7f8b96"}
              multiline
              textAlignVertical="top"
              style={[styles.modalTextarea, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderColor, color: theme.colors.text }]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[{fontWeight: "700"}, { color: theme.colors.text }]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAddEntries}
              >
                <Text style={[{fontWeight: "700"}, { color: theme.colors.text }]}>確認</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={categoryModalVisible && !deletecategoryModalVisible} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCategoryModalVisible(false)}
        >
          <Pressable style={[styles.categoryModalCard, { backgroundColor: theme.colors.background }]} onPress={() => { }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.modalOption} onPress={() => {
                setCategoryModalVisible(false);
              }}>
                <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>取消</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>編輯段落標題</Text>
              <TouchableOpacity style={styles.modalOption} onPress={handleSaveCategory}>
                <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>儲存</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={editingCategoryTitle}
              onChangeText={setEditingCategoryTitle}
              style={[styles.modalInput, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderColor, color: theme.colors.text }]}
              placeholder="輸入新標題"
              placeholderTextColor={theme.dark ? "#888" : "#7f8b96"}
            />
            <TouchableOpacity style={styles.modalOption} onPress={handleDeleteCategory}>
              <Text style={[styles.modalOptionText, { color: 'red' }]}>刪除段落標題</Text>
            </TouchableOpacity>
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
    paddingBottom: 100,
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
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
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
    marginTop: 8,
    // backgroundColor: "red",
  },
  titleInput: {
    width: "80%",
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
    // backgroundColor: "white",
  },
  icon: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "pink",
  },
  line: {
    width: "100%",
    height: 1,
    marginTop: 8,
  },
  categorySection: {
    // backgroundColor: "yellow",
  },
  categoryRow: {
    flexDirection: "row",
    gap: 10,
    // backgroundColor: "pink",
  },
  categoryRowContent: {
    gap: 10,
    paddingVertical: 5,
  },
  categoryChip: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  categoryChipText: {
    fontWeight: "500",
  },
  addIconBtn: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  addCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  categoryInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  checkButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupCard: {
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  noSectionContainer: {
    width: "108%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: 'flex-start',
    // backgroundColor: "gray",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    justifyContent: 'flex-start',
    // backgroundColor: "pink",
  },
  groupTitleContainer: {
    height: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // backgroundColor: "green",
  },
  groupTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  groupTitleicon: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  groupTitleiconRow: {
    flexDirection: "row",
    gap: 10,
  },
  entryButton: {
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    // marginBottom: 10,
    alignSelf: 'flex-start',
  },
  entryButtonText: {
    flex: 1,
    fontWeight: "500",
  },
  floatingButton: {
    // backgroundColor: "pink",
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
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
  categoryModalCard: {
    backgroundColor: "#fff9f0",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 36,
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#1b3147",
    flex: 1,
  },
  modalInput: {
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#fffdf9",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#24384c",
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#1b3147",
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
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
  },
  modalSectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalCategoryChip: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalButton: {
    height: 48,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
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
