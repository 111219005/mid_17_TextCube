import { useRef, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";

export default function ImageUploadBox({ onToggleTopbar }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [zoomed, setZoomed] = useState(false);
    const longPressTriggered = useRef(false);


    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("需要權限", "請允許存取相簿，才能上傳照片。");
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
        onToggleTopbar(false);
        setZoomed((prev) => !prev);
    };

    const handleImageLongPress = () => {
        longPressTriggered.current = true;
        onToggleTopbar(false);
        setZoomed(false);
        setShowAlert(true);
    };

    const handleMenuOption = async (option) => {
        setShowAlert(false);
        onToggleTopbar(true);
        if (option === "change") {
            setTimeout(async () => {
                await pickImage();
            }, Platform.OS === 'ios' ? 10 : 0);
        } else if (option === "reset") {
            setSelectedImage(null);
        }
    };

    const closeAlert = () => {
        setShowAlert(false);
        onToggleTopbar(true);
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
                    style={({ pressed }) => [styles.uploadBox, zoomed && styles.zoomed, pressed && styles.pressed]}
                >
                    <Image
                        source={selectedImage ? { uri: selectedImage } : require("../assets/image/sakura.jpg")}
                        resizeMode="cover"
                        style={styles.image}
                    />
                </Pressable>
            </View>
            {zoomed && (
                <Pressable
                    style={styles.zoomOverlay}
                    onPress={() => {
                        setZoomed(false);
                        onToggleTopbar(true);
                    }}
                    onLongPress={handleImageLongPress}
                    delayLongPress={500}
                >
                    <View style={styles.zoomedContainer}>
                        <Image
                            source={selectedImage ? { uri: selectedImage } : require("../assets/image/sakura.jpg")}
                            resizeMode="cover"
                            style={styles.zoomedImage}
                        />
                    </View>
                </Pressable>
            )}
            {showAlert && (
                <Pressable
                    style={styles.alertOverlayContainer}
                    onPress={closeAlert}
                >
                    <View style={styles.alertContentWrapper}>
                        <View style={styles.alertWordArea}>
                            <View style={styles.alertHeader}>
                                <Text style={styles.alertTitle}>照片選項</Text>
                                <Text style={styles.alertSubtitle}>請選擇要執行的動作</Text>
                            </View>
                            <View style={styles.alertOptionsAll}>

                                <Pressable
                                    style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                                    onPress={() => handleMenuOption("reset")}
                                >
                                    <Text style={[styles.menuText, { color: '#012b57' }]}>重設照片</Text>
                                </Pressable>

                                <View style={styles.alertOptionsRight}>
                                    <Pressable
                                        style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                                        onPress={closeAlert}
                                    >
                                        <Text style={[styles.menuText, { color: '#666' }]}>取消</Text>
                                    </Pressable>

                                    <Pressable
                                        style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                                        onPress={() => handleMenuOption("change")}
                                    >
                                        <Text style={[styles.menuText, { color: '#012b57' }]}>更換照片</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 0,
        width: "110%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "red"
    },
    imagePosition: {
        position: 'absolute',
        zIndex: 1,
        width: "85%",
        height: "100%",
        alignItems: "flex-end",
        justifyContent: "center",
        // backgroundColor: "yellow",
    },
    uploadBox: {
        position: 'absolute',
        width: "45%",
        height: "65%",
        backgroundColor: "#000",
        zIndex: 1,
    },
    alertOverlayContainer: {
        position: 'absolute',
        zIndex: 10,
        paddingTop: "75%",
        alignItems: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        // backgroundColor: "blue",
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
        backgroundColor: "transparent",
    },
    alertSubtitle: {
        fontSize: 13,
        color: "#666",
        fontWeight: "500",
        backgroundColor: "transparent",
    },
    alertOptionsAll: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    alertOptionsRight: {
        flexDirection: "row",
        gap: 12,
    },
    menuItem: {
        alignItems: "flex-start",
    },
    menuItemPressed: {
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        borderRadius: 8,
    },
    menuText: {
        fontSize: 16,
        fontWeight: "600",
        paddingVertical: 8,
        paddingHorizontal: 5,
    },
    pressed: {
        opacity: 0.85,
    },
    image: {
        position: 'absolute',
        width: "100%",
        height: "100%",
        zIndex: 2,
    },
    zoomed: {
        width: "55%",
        height: "80%",
    },
    zoomOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    zoomedContainer: {
        width: '90%',
        aspectRatio: 157 / 534,
        maxHeight: '90%',
        overflow: 'hidden',
    },
    zoomedImage: {
        width: '100%',
        height: '100%',
    },

});