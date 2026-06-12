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

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('錯誤', '請填入電子郵件和密碼');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with Firebase authentication
      await signIn(email, password);
      Alert.alert('成功', '登入成功！');
      router.replace('/');
    } catch (error) {
      Alert.alert('登入失敗', error.message || '請重試');
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
              <Text style={[styles.title, { color: theme.colors.text }]}>歡迎回來</Text>
              <Text style={[styles.subtitle, { color: theme.colors.text }]}>登入你的帳號以繼續</Text>
            </View>

            <View style={styles.form}>
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
                    placeholder="輸入密碼"
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

              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: theme.colors.primary, opacity: isLoading ? 0.6 : 1 }]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={[styles.loginButtonText, { color: theme.colors.card }]}>
                  {isLoading ? '登入中...' : '登入'}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.text + '40' }]} />
                <Text style={[styles.dividerText, { color: theme.colors.text }]}>或</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.text + '40' }]} />
              </View>

              <TouchableOpacity
                style={[styles.registerButton, { borderColor: theme.colors.primary, borderWidth: 1 }]}
                onPress={() => router.push('/Register')}
                disabled={isLoading}
              >
                <Text style={[styles.registerButtonText, { color: theme.colors.primary }]}>
                  建立新帳號
                </Text>
              </TouchableOpacity>
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
  loginButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  registerButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
