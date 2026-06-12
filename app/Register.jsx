import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Feather from '@expo/vector-icons/Feather';
import BackTopBar from '../components/BackTopBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('錯誤', '請填入所有欄位');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('錯誤', '密碼不相符');
      return;
    }

    if (password.length < 6) {
      Alert.alert('錯誤', '密碼至少需要6個字符');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with Firebase authentication
      await signUp(email, password, username.trim());
      Alert.alert('成功', '帳號建立成功！');
      router.replace('/');
    } catch (error) {
      Alert.alert('註冊失敗', error.message || '請重試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={ styles.container }>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>建立帳號</Text>
              <Text style={[styles.subtitle, { color: theme.colors.text }]}>加入我們開始使用 TextCube</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>使用者名稱</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  placeholder="選擇一個使用者名稱"
                  placeholderTextColor={theme.colors.text + '80'}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>電子郵件</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  placeholder="example@email.com"
                  placeholderTextColor={theme.colors.text + '80'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>密碼</Text>
                <View style={[styles.passwordInput, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}>
                  <TextInput
                    style={[styles.passwordField, { color: theme.colors.text }]}
                    placeholder="設定密碼（至少6個字符）"
                    placeholderTextColor={theme.colors.text + '80'}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Feather
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>確認密碼</Text>
                <View style={[styles.passwordInput, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}>
                  <TextInput
                    style={[styles.passwordField, { color: theme.colors.text }]}
                    placeholder="再次輸入密碼"
                    placeholderTextColor={theme.colors.text + '80'}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Feather
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, { backgroundColor: theme.colors.primary, opacity: isLoading ? 0.6 : 1 }]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={[styles.registerButtonText, { color: theme.colors.card }]}>
                  {isLoading ? '建立中...' : '建立帳號'}
                </Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.colors.text }]}>已有帳號？ </Text>
                <TouchableOpacity onPress={() => router.push('/Login')} disabled={isLoading}>
                  <Text style={[styles.footerLink, { color: theme.colors.primary }]}>登入</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordField: {
    flex: 1,
    fontSize: 14,
  },
  registerButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
