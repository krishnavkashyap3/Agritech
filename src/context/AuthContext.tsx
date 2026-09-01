import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  updateProfile,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole, OrderTransaction, UserComplaint } from '../types';
import { DEMO_USERS, INITIAL_COMPLAINTS } from '../data/mockData';

// Helper to remove any undefined fields before writing to Firestore
function removeUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = removeUndefinedFields(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export const GUEST_USER: UserProfile = {
  id: '',
  name: '',
  email: '',
  role: 'organisation',
  location: '',
  verified: false,
  rating: 0,
  totalDeals: 0,
};

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  isAuthenticated: boolean;
  loading: boolean;
  isFirebaseConnected: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role: UserRole, location: string, orgOrFarmName?: string, phone?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
  saveUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  saveOrderToFirestore: (order: OrderTransaction) => Promise<void>;
  firestoreOrders: OrderTransaction[];
  saveComplaintToFirestore: (complaint: UserComplaint) => Promise<void>;
  firestoreComplaints: UserComplaint[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  
  // Clean default guest user when not signed in (no random Patil Krishi profile)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem('agritech_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) return parsed;
      }
    } catch {}
    return GUEST_USER;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [firestoreOrders, setFirestoreOrders] = useState<OrderTransaction[]>([]);
  const [firestoreComplaints, setFirestoreComplaints] = useState<UserComplaint[]>([]);

  const isAuthenticated = Boolean(
    firebaseUser !== null ||
    (currentUser.id && currentUser.id.length > 0 && currentUser.email && currentUser.email.length > 0)
  );

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          // Fetch user profile from Firestore 'users' collection
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserProfile;
            setCurrentUser({
              ...data,
              id: user.uid,
              email: user.email || data.email,
            });
          } else {
            // If new user or profile doesn't exist yet, create default
            const initialProfile: UserProfile = {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'KrishiQuant Member',
              email: user.email || '',
              role: 'farmer',
              farmName: 'My Agro Farm & FPO',
              location: 'Nashik, Maharashtra',
              verified: true,
              rating: 5.0,
              totalDeals: 0,
              avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
            };
            await setDoc(userDocRef, removeUndefinedFields(initialProfile), { merge: true });
            setCurrentUser(initialProfile);
          }
        } catch (error) {
          console.warn('Could not read user profile from Firestore:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore Orders for this user (buyer or seller)
  useEffect(() => {
    if (!firebaseUser) {
      setFirestoreOrders([]);
      return;
    }

    try {
      // Query orders where user is buyer or seller
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('buyerId', 'in', [firebaseUser.uid, currentUser.id, 'all'])
      );

      const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
        const list: OrderTransaction[] = [];
        snapshot.forEach((doc) => {
          const item = doc.data() as OrderTransaction;
          // Filter if related to current user or if demo
          if (item.buyerId === firebaseUser.uid || item.sellerId === firebaseUser.uid || item.buyerId === currentUser.id) {
            list.push({ ...item, id: doc.id });
          }
        });
        if (list.length > 0) {
          setFirestoreOrders(list);
        }
      }, (err) => {
        console.warn('Orders snapshot warning:', err);
      });

      return () => unsubOrders();
    } catch (e) {
      console.warn('Error subscribing to orders:', e);
    }
  }, [firebaseUser, currentUser.id]);

  // Listen to Firestore Complaints in real-time
  useEffect(() => {
    try {
      const complaintsRef = collection(db, 'complaints');
      const unsubComplaints = onSnapshot(complaintsRef, (snapshot) => {
        const list: UserComplaint[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as UserComplaint;
          list.push({ ...data, id: docSnap.id });
        });
        if (list.length > 0) {
          // Sort by creation date descending
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setFirestoreComplaints(list);
        }
      }, (err) => {
        console.warn('Complaints snapshot warning:', err);
      });

      return () => unsubComplaints();
    } catch (e) {
      console.warn('Error subscribing to complaints:', e);
    }
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      // Load doc
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        setCurrentUser(snap.data() as UserProfile);
      }
    } catch (err: any) {
      console.warn('Firebase Email Sign-In issue:', err?.code || err?.message);
      // Check if user was registered locally or in demo storage
      const savedUserStr = localStorage.getItem('agritech_current_user');
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser.email?.toLowerCase() === email.toLowerCase()) {
            setCurrentUser(savedUser);
            return;
          }
        } catch {}
      }
      throw err;
    }
  };

  const signUpWithEmail = async (
    email: string, 
    pass: string, 
    name: string, 
    role: UserRole, 
    location: string, 
    orgOrFarmName?: string, 
    phone?: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });

      const newProfile: UserProfile = {
        id: user.uid,
        name,
        email,
        role,
        ...(role === 'farmer' 
          ? { farmName: orgOrFarmName?.trim() || `${name}'s Farm & FPO` } 
          : { orgName: orgOrFarmName?.trim() || `${name} Agri Corp` }),
        location: location || 'Pune Agro Belt, Maharashtra',
        phone: phone || '+91 98000 00000',
        verified: true,
        rating: 5.0,
        totalDeals: 0,
        avatarUrl: role === 'farmer' 
          ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      };

      // Save to Firestore without any undefined properties
      await setDoc(doc(db, 'users', user.uid), removeUndefinedFields(newProfile), { merge: true });
      setCurrentUser(newProfile);
    } catch (err: any) {
      console.warn('Firebase Email Sign-Up issue:', err?.code || err?.message);
      
      // If Email provider is not enabled in Firebase Console (auth/operation-not-allowed)
      if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        const localUserId = `user_${Date.now()}`;
        const fallbackProfile: UserProfile = {
          id: localUserId,
          name,
          email,
          role,
          ...(role === 'farmer' 
            ? { farmName: orgOrFarmName?.trim() || `${name}'s Farm & FPO` } 
            : { orgName: orgOrFarmName?.trim() || `${name} Agri Corp` }),
          location: location || 'Pune Agro Belt, Maharashtra',
          phone: phone || '+91 98000 00000',
          verified: true,
          rating: 5.0,
          totalDeals: 0,
          avatarUrl: role === 'farmer' 
            ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        };

        try {
          await setDoc(doc(db, 'users', localUserId), removeUndefinedFields(fallbackProfile), { merge: true });
        } catch (dbErr) {
          console.warn('Local profile save to Firestore fallback:', dbErr);
        }
        setCurrentUser(fallbackProfile);
        try {
          localStorage.setItem('agritech_current_user', JSON.stringify(fallbackProfile));
        } catch {}
        return;
      }
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning:', e);
    }
    setFirebaseUser(null);
    try {
      localStorage.removeItem('agritech_current_user');
      localStorage.removeItem('agritech_demo_auth');
    } catch {}
    setCurrentUser(GUEST_USER);
  };

  const saveUserProfile = async (profileUpdate: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...profileUpdate };
    setCurrentUser(updated);
    try {
      localStorage.setItem('agritech_current_user', JSON.stringify(updated));
    } catch {}

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), removeUndefinedFields(updated), { merge: true });
      } catch (err) {
        console.error('Failed to update Firestore profile:', err);
      }
    } else if (currentUser.id) {
      try {
        await setDoc(doc(db, 'users', currentUser.id), removeUndefinedFields(updated), { merge: true });
      } catch (err) {
        console.warn('Could not update non-firebase user in firestore:', err);
      }
    }
  };

  const saveOrderToFirestore = async (order: OrderTransaction) => {
    try {
      // Add or set document in 'orders' collection with sanitized fields
      const orderPayload = {
        ...order,
        buyerId: firebaseUser ? firebaseUser.uid : (currentUser.id || order.buyerId),
        buyerName: currentUser.name,
        buyerRole: currentUser.role,
        timestamp: new Date().toISOString(),
      };
      await setDoc(doc(db, 'orders', order.id), removeUndefinedFields(orderPayload), { merge: true });
    } catch (e) {
      console.warn('Could not persist order to Firestore, keeping locally:', e);
    }
  };

  const saveComplaintToFirestore = async (complaint: UserComplaint) => {
    try {
      const complaintPayload = {
        ...complaint,
        userId: firebaseUser ? firebaseUser.uid : (currentUser.id || 'guest-user'),
        userRole: currentUser.role || 'farmer',
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'complaints', complaint.id), removeUndefinedFields(complaintPayload), { merge: true });
    } catch (e) {
      console.warn('Could not persist complaint to Firestore, stored in local state:', e);
    }
  };

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      currentUser,
      setCurrentUser,
      isAuthenticated,
      loading,
      isFirebaseConnected: true,
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
      logOut,
      saveUserProfile,
      saveOrderToFirestore,
      firestoreOrders,
      saveComplaintToFirestore,
      firestoreComplaints,
    }}>
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
