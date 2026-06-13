import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUri, setAvatarUri] = useState(require('../assets/image/sakura.jpg'));

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!isMounted) {
        return;
      }
      if (authUser) {
        try {
          const userRef = doc(db, 'users', authUser.uid);
          const userSnap = await getDoc(userRef);
          const profile = userSnap.exists() ? userSnap.data() : null;

          setUser({
            id: authUser.uid,
            email: authUser.email,
            username: profile?.username || authUser.email?.split('@')[0] || '使用者',
          });

          if (profile?.avatarUri) {
            setAvatarUri({ uri: profile.avatarUri });
          }
        } catch (e) {
          setUser({
            id: authUser.uid,
            email: authUser.email,
            username: authUser.email?.split('@')[0] || '使用者',
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const authContext = {
    signUp: async (email, password, username) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;
      const userRef = doc(db, 'users', authUser.uid);
      await setDoc(userRef, {
        email: authUser.email,
        username,
        createdAt: serverTimestamp(),
        avatarUri: null,
      });
      const newUser = {
        id: authUser.uid,
        email: authUser.email,
        username,
      };
      setUser(newUser);
      return newUser;
    },
    signIn: async (email, password) => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;
      const userRef = doc(db, 'users', authUser.uid);
      const userSnap = await getDoc(userRef);
      const profile = userSnap.exists() ? userSnap.data() : null;
      const signedInUser = {
        id: authUser.uid,
        email: authUser.email,
        username: profile?.username || authUser.email?.split('@')[0] || '使用者',
      };
      setUser(signedInUser);
      if (profile?.avatarUri) {
        setAvatarUri({ uri: profile.avatarUri });
      }
      return signedInUser;
    },
    signOut: async () => {
      await firebaseSignOut(auth);
      setUser(null);
      setAvatarUri(require('../assets/image/sakura.jpg'));
    },
    updateAvatar: async (uri) => {
      if (user?.id) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { avatarUri: uri });
      }
      setAvatarUri({ uri });
    },
    updateUsername: async (username) => {
      if (user?.id) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { username });
        setUser({ ...user, username });
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
