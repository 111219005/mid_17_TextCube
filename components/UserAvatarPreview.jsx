import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useColorScheme } from 'react-native';

export default function UserAvatarPreview({ showPreviewModal = true }) {
    const { theme } = useTheme();
    const { avatarUri, updateAvatar } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const colorScheme = useColorScheme();

    // 根據配色決定背景顏色
    const backdropColor = colorScheme === 'dark' 
     ? 'rgba(0, 0, 0, 0.8)'      // 深色模式：深黑底
     : 'rgba(255, 255, 255, 0.9)'; // 淺色模式：白底帶透明

    const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        '需要權限',
        '請允許存取照片庫以更改頭像。'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setIsUploading(true);
      try {
        await updateAvatar(result.assets[0].uri);
        setModalVisible(false);
      } catch (error) {
        Alert.alert('錯誤', '無法更新頭像，請重試。');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const displayUri = typeof avatarUri === 'string' ? { uri: avatarUri } : avatarUri;

  return (
    <>
      <TouchableOpacity
        onLongPress={() => {
          if (showPreviewModal) {
            setModalVisible(true);
          }
        }}
        style={[styles.avatarContainer, { borderColor: theme.colors.primary }]}
        delayLongPress={500}
      >
        <Image
          source={displayUri}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {showPreviewModal && (
        <Modal
          transparent
          visible={modalVisible}
          statusBarTranslucent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
            <View style={[styles.modalOverlay, { backgroundColor: backdropColor }]}>
                <Pressable style={styles.modalBackground} onPress={() => setModalVisible(false)} />
                <View style={styles.modalInner} pointerEvents="box-none">
                    <View style={styles.largeAvatarContainer}>
                        <Image source={displayUri} style={styles.largeAvatar} />
                        <TouchableOpacity
                        style={[styles.imagePickButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handlePickImage}
                        disabled={isUploading}
                        >
                        {isUploading ? (
                            <ActivityIndicator color={theme.colors.card} size="small" />
                        ) : (
                            <Feather name="image" size={18} color={theme.colors.card} />
                        )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  modalInner: {
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  largeAvatarContainer: {
    position: 'relative',
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 120,
  },
  imagePickButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
