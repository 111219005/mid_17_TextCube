import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUri, setAvatarUri] = useState(require('../assets/image/sakura.jpg'));

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      const savedAvatar = await AsyncStorage.getItem('userAvatar');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      if (savedAvatar) {
        setAvatarUri({ uri: savedAvatar });
      }
    } catch (e) {
      // Restoring token failed
    } finally {
      setIsLoading(false);
    }
  };

  const authContext = {
    signUp: async (email, password, username) => {
      // TODO: Implement Firebase signup
      const newUser = { email, username, id: Date.now().toString() };
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    },
    signIn: async (email, password) => {
      // TODO: Implement Firebase login
      const user = { email, username: email.split('@')[0], id: Date.now().toString() };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return user;
    },
    signOut: async () => {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userAvatar');
      setUser(null);
      setAvatarUri(require('../assets/image/sakura.jpg'));
    },
    updateAvatar: async (uri) => {
      await AsyncStorage.setItem('userAvatar', uri);
      setAvatarUri({ uri });
    },
    updateUsername: async (username) => {
      if (user) {
        const updatedUser = { ...user, username };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    },
    isSignedIn: !!user,
    user,
    avatarUri,
    isLoading,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
