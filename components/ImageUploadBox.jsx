import { useRef, useState } from "react";
import { Alert, Image, Modal, Platform, Pressable, StyleSheet, Text, View,} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function ImageUploadBox( ) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const longPressTriggered = useRef(false);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("需要權限", "請允許存取相簿後再選擇圖片。");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [157, 534],
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleImagePress = () => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    setZoomed((prev) => !prev);
  };

  const handleImageLongPress = () => {
    longPressTriggered.current = true;
    setZoomed(false);
    setShowAlert(true);
  };

  const handleMenuOption = (option) => {
    setShowAlert(false);

    if (option === "change") {
      setTimeout(() => {
        pickImage();
      }, Platform.OS === "ios" ? 10 : 0);
    } else if (option === "reset") {
      setSelectedImage(null);
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  const closeZoom = () => {
    setZoomed(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imagePosition}>
        <Pressable
          onPress={handleImagePress}
          onLongPress={handleImageLongPress}
          delayLongPress={500}
          onPressOut={() => {
            if (longPressTriggered.current) {
              longPressTriggered.current = false;
            }
          }}
          style={({ pressed }) => [
            styles.uploadBox,
            zoomed && styles.zoomed,
            pressed && styles.pressed,
          ]}
        >
          <Image
            source={
              selectedImage
                ? { uri: selectedImage }
                : require("../assets/image/sakura.jpg")
            }
            resizeMode="cover"
            style={styles.image}
          />
        </Pressable>
      </View>

      <Modal visible={zoomed} transparent animationType="none">
        <Pressable style={styles.zoomOverlay} onPress={closeZoom}>
          <View style={styles.zoomedContainer}>
            <Image
              source={
                selectedImage
                  ? { uri: selectedImage }
                  : require("../assets/image/sakura.jpg")
              }
              resizeMode="cover"
              style={styles.zoomedImage}
            />
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showAlert} transparent animationType="none">
        <Pressable style={styles.alertOverlayContainer} onPress={closeAlert}>
          <View style={styles.alertContentWrapper}>
            <View style={styles.alertWordArea}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>圖片選項</Text>
                <Text style={styles.alertSubtitle}>請選擇要執行的操作。</Text>
              </View>

              <View style={styles.alertOptionsAll}>
                <Pressable
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                  ]}
                  onPress={() => handleMenuOption("reset")}
                >
                  <Text style={[styles.menuText, styles.primaryText]}>
                    重設圖片
                  </Text>
                </Pressable>

                <View style={styles.alertOptionsRight}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && styles.menuItemPressed,
                    ]}
                    onPress={closeAlert}
                  >
                    <Text style={[styles.menuText, styles.secondaryText]}>
                      取消
                    </Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && styles.menuItemPressed,
                    ]}
                    onPress={() => handleMenuOption("change")}
                  >
                    <Text style={[styles.menuText, styles.primaryText]}>
                      更換圖片
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 0,
    width: "110%",
    height: "100%",
    alignItems: "center",
    // justifyContent: "center",
    // backgroundColor: "pink",
  },
  imagePosition: {
    position: "absolute",
    zIndex: 1,
    width: "85%",
    height: "100%",
    alignItems: "flex-end",
    marginTop: "25%"
    // justifyContent: "center",
  },
  uploadBox: {
    position: "absolute",
    width: "45%",
    height: "65%",
    backgroundColor: "#000",
    zIndex: 1,
    overflow: "hidden",
  },
  alertOverlayContainer: {
    flex: 1,
    paddingTop: "75%",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  alertContentWrapper: {
    width: "85%",
    height: "35%",
  },
  alertWordArea: {
    width: "100%",
    height: "100%",
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  alertHeader: {
    paddingBottom: 14,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  alertOptionsAll: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertOptionsRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItem: {
    alignItems: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  menuItemPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 8,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#012b57",
  },
  secondaryText: {
    color: "#666",
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  zoomed: {
    width: "55%",
    height: "80%",
  },
  zoomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomedContainer: {
    width: "90%",
    aspectRatio: 157 / 534,
    maxHeight: "90%",
    overflow: "hidden",
  },
  zoomedImage: {
    width: "100%",
    height: "100%",
  },
});
