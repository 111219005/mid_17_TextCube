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
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>{library.title}</Text>
                    <TouchableOpacity style={styles.groupTitleicon} onPress={() => { setSelectedLibrary(library); setEditingTitle(library.title); setModalVisible(true); }}>
                      <Feather name="more-horizontal" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cardMeta}>
                    {library.categories.length} sections / {library.entries.length} entries
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
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <TouchableOpacity style={styles.modalOption} onPress={() => { 
                  setModalVisible(false); 
                }}>
                  <Text style={styles.modalOptionText}>取消</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>編輯文字庫</Text>
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
              <TextInput
                value={editingTitle}
                onChangeText={setEditingTitle}
                style={styles.modalInput}
                placeholder="輸入新標題"
              />
              <TouchableOpacity style={styles.modalOption} onPress={() => { 
                setDeleteModalVisible(true);
              }}>
                <Text style={[styles.modalOptionText, { color: 'red' }]}>刪除文字庫</Text>
              </TouchableOpacity>
              
            </Pressable>
          </Pressable>
        </Modal>

        <Modal transparent visible={deleteModalVisible} animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setDeleteModalVisible(false)}
          >
            <Pressable style={styles.deleteModalCard} onPress={() => {}}>
              <Text style={styles.deleteModalTitle}>刪除文字庫</Text>
              <View style={styles.deleteModalButtonsContainer}>
                <TouchableOpacity style={styles.deleteConfirmButton} onPress={() => {
                  if (selectedLibrary) {
                    deleteLibrary(selectedLibrary.id);
                  }
                  setDeleteModalVisible(false);
                  setModalVisible(false);
                }}>
                  <Text style={[styles.modalOptionText, { color: 'red', textAlign: 'center' }]}>確認刪除</Text>
                </TouchableOpacity>
                <View style={styles.deleteModalDivider} />
                <TouchableOpacity style={styles.deleteCancelButton} onPress={() => { 
                  setDeleteModalVisible(false);
                }}>
                  <Text style={[styles.modalOptionText, { textAlign: 'center' }]}>取消</Text>
                </TouchableOpacity>
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
    // marginBottom: 6,
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
    color: "#a06034",
    fontWeight: "700",
    //marginBottom: 10,
  },
  cardPreview: {
    color: "#667787",
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(16, 25, 35, 0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff9f0",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 36,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d8c9b8",
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
