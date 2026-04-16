import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Pressable, TextInput } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useTextLibraries } from "../components/TextLibraryContext.jsx";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

const DEFAULT_IMAGE = require("../assets/image/sakura.jpg");

export default function TextLibraries() {
  const router = useRouter();
  const { libraries, saveLibrary, deleteLibrary } = useTextLibraries();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");


  return (
    <View style={[styles.container]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.text}]}
            onPress={() => router.push("/AddTextLibrary")}
          >
            <Feather name="plus" size={18} color={theme.colors.card} />
            <Text style={{ color: theme.colors.card}}>New</Text>
          </TouchableOpacity>
        </View>

        {libraries.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>尚未建立任何文字庫。</Text>
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
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{library.title}</Text>
                  <TouchableOpacity style={styles.groupTitleicon} onPress={() => { setSelectedLibrary(library); setEditingTitle(library.title); setModalVisible(true); }}>
                    <Feather name="more-horizontal" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.cardMeta]}>
                  {library.categories.length} 個段落標題 / {library.entries.length} 個文字方塊
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal transparent visible={modalVisible && !deleteModalVisible} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={[styles.modalCard, { backgroundColor: theme.colors.card }]} onPress={() => { }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>編輯文字庫標題</Text>
            </View>
            <TextInput
              value={editingTitle}
              onChangeText={setEditingTitle}
              style={[styles.modalInput, { backgroundColor: theme.colors.borderColor, borderColor: theme.colors.primary, color: theme.colors.text }]}
              placeholder="輸入新標題"
            />
            <View style={styles.modalOptionBottons}>
              <TouchableOpacity style={styles.modalOption} onPress={() => {
                setDeleteModalVisible(true);
              }}>
                <Text style={[styles.modalOptionText, { color: 'red' }]}>刪除文字庫</Text>
              </TouchableOpacity>
              <View style={styles.deleteandCancel}>
                <TouchableOpacity style={styles.modalOption} onPress={() => {
                  setModalVisible(false);
                }}>
                  <Text style={styles.modalOptionText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={() => {
                  if (selectedLibrary) {
                    saveLibrary({
                      ...selectedLibrary,
                      title: editingTitle.trim() || selectedLibrary.title,
                    });
                  }
                  setModalVisible(false);
                }}>
                  <Text style={styles.modalOptionText}>儲存</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
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
    // backgroundColor: "#ff000080",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    marginBottom: 22,
    gap: 12,
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
    borderRadius: 8,
    borderWidth: 1,
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
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
  cardTitle: {
    fontSize: 21,
    fontWeight: "600",
  },
  groupTitleicon: {
    width: 32,
    height: 32,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardMeta: {
    color: "#919191",
    fontSize: 14,
    // fontWeight: "700",
  },
  cardPreview: {
    color: "#667787",
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff9f0",
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
    color: "#1b3147",
    flex: 1,
  },
  modalInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  modalOptionBottons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deleteandCancel: {
    flexDirection: "row",
    gap: 15,
  },
  modalOption: {
    paddingVertical: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#1b3147",
  },
  deleteModalCard: {
    backgroundColor: "#fff9f0",
    borderRadius: 28,
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: "80%",
    overflow: "hidden",
  },
  deleteModalTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#1b3147",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
  },
  deleteModalButtonsContainer: {
    flexDirection: "row",
  },
  deleteConfirmButton: {
    flex: 1,
    paddingVertical: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalDivider: {
    width: 1,
    backgroundColor: "#e5d7c7",
    height: "100%",
  },
  deleteCancelButton: {
    flex: 1,
    paddingVertical: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});
