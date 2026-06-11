import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect, useContext } from "react";
import { useTextLibraries } from "../components/TextLibraryContext.jsx";
import { useTheme } from "../context/ThemeContext";
import { ScrollToTopContext } from "../components/ScrollToTopContext.jsx";

const DEFAULT_IMAGE = require("../assets/image/sakura.jpg");

export default function Page() {
  const router = useRouter();
  const { libraries, saveLibrary, deleteLibrary } = useTextLibraries();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const { register } = useContext(ScrollToTopContext);
  const scrollRef = useRef(null);
  useEffect(() => {
    register(scrollRef);
    return () => register(null);
  }, [register]);

  const openEditModal = (library) => {
    setSelectedLibrary(library);
    setEditingTitle(library.title);
    setModalVisible(true);
  };

  const closeEditModal = () => {
    setModalVisible(false);
    setSelectedLibrary(null);
    setEditingTitle("");
  };

  const handleSaveTitle = () => {
    if (selectedLibrary) {
      saveLibrary({
        ...selectedLibrary,
        title: editingTitle.trim() || selectedLibrary.title,
      });
    }
    closeEditModal();
  };

  const handleDeleteLibrary = () => {
    if (selectedLibrary) {
      deleteLibrary(selectedLibrary.id);
    }
    setDeleteModalVisible(false);
    closeEditModal();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.screen}
        contentContainerStyle={[styles.content, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}   
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.text }]}
            onPress={() => router.push("/AddTextLibrary")}
          >
            <Feather name="plus" size={18} color={theme.colors.card} />
            <Text style={[styles.addButtonText, { color: theme.colors.card }]}>New</Text>
          </TouchableOpacity>
        </View>

        {libraries.length === 0 ? (
          <View style={[styles.emptyCard]}>
            {theme.dark ? (
              <Image
                source={require("../assets/icon/logo_light/logo_light.png")}
                style={styles.logo}
              />
            ) : (
              <Image
                source={require("../assets/icon/logo/logo.png")}
                style={styles.logo}
              />
            )}
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>新增的文字庫會顯示在這裡</Text>
          </View>
        ) : (
          libraries.map((library) => (
            <TouchableOpacity
              key={library.id}
              style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}
              onPress={() => router.push(`/AddTextLibrary?id=${library.id}`)}
            >
              <Image
                source={library.bannerUri ? { uri: library.bannerUri } : DEFAULT_IMAGE}
                style={styles.cardImage}
              />
              <View style={styles.cardBody}>
                <View style={styles.titleRow}>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{library.title || "無題"}</Text>
                  <TouchableOpacity
                    style={styles.groupTitleIcon}
                    onPress={(event) => {
                      event.stopPropagation();
                      openEditModal(library);
                    }}
                  >
                    <Feather name="more-horizontal" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardMeta}>
                  {library.categories.length} 個段落標題 / {library.entries.length} 個文字方塊
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal transparent visible={modalVisible && !deleteModalVisible} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeEditModal}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.colors.card }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>編輯文字庫名稱</Text>
            </View>
            <TextInput
              value={editingTitle}
              onChangeText={setEditingTitle}
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.borderColor,
                  borderColor: theme.colors.primary,
                  color: theme.colors.text,
                },
              ]}
              placeholder="輸入文字庫名稱"
              placeholderTextColor="#919191"
            />
            <View style={styles.modalOptionButtons}>
              <TouchableOpacity style={styles.modalOption} onPress={() => setDeleteModalVisible(true)}>
                <Text style={[styles.modalOptionText, { color: "red" }]}>刪除文字庫</Text>
              </TouchableOpacity>
              <View style={styles.deleteAndCancel}>
                <TouchableOpacity style={styles.modalOption} onPress={closeEditModal}>
                  <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={handleSaveTitle}>
                  <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>儲存</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={deleteModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModalCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.deleteModalTitle, { color: theme.colors.text }]}>確定要刪除這個文字庫嗎？</Text>
            <View style={styles.deleteModalButtonsContainer}>
              <TouchableOpacity style={styles.deleteCancelButton} onPress={() => setDeleteModalVisible(false)}>
                <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirmButton} onPress={handleDeleteLibrary}>
                <Text style={[styles.modalOptionText, { color: "red" }]}>確認刪除</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    marginTop: 22,
    marginBottom: 22,
    gap: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addButtonText: {
    fontWeight: "800",
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    flex: 0.5,
    padding: 20,
  },
  logo: {
    width: 84,
    height: 84,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 14,
  },
  card: {
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  cardBody: {
    padding: 15,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 21,
    fontWeight: "600",
  },
  groupTitleIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMeta: {
    color: "#919191",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 30,
    width: "80%",
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
    flex: 1,
  },
  modalInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  modalOptionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deleteAndCancel: {
    flexDirection: "row",
    gap: 15,
  },
  modalOption: {
    paddingVertical: 12,
  },
  modalOptionText: {
    fontSize: 16,
  },
  deleteModalCard: {
    borderRadius: 8,
    width: "80%",
    overflow: "hidden",
  },
  deleteModalTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
  },
  deleteModalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteConfirmButton: {
    flex: 1,
    paddingVertical: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteCancelButton: {
    flex: 1,
    paddingVertical: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});
