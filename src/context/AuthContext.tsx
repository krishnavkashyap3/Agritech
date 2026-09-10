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
  signInWithEmail: (email: string, pass: string, chosenRole?: UserRole) => Promise<void>;
  signInAsDemoRole: (role: UserRole) => void;
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

interface RegisteredAccount {
  profile: UserProfile;
  passHash: string;
}

export const isDemoUser = (user: UserProfile | null | undefined): boolean => {
  if (!user || !user.id) return false;
  return (
    user.id === 'farmer_ramesh_1' ||
    user.id === 'fpo_sahyadri_1' ||
    user.id === 'org_itc_1' ||
    user.id === 'ind_rasoi_1' ||
    user.id === 'demo_farmer_1' ||
    user.email === 'ramesh.patil@kisanmail.in' ||
    user.email === 'sahyadri.fpo@agrocoop.in' ||
    user.email === 'procurement@itc-agri.in' ||
    user.email === 'priya.sharma@rasoifoods.com'
  );
};

const getRegisteredAccounts = (): Record<string, RegisteredAccount> => {
  try {
    const raw = localStorage.getItem('agritech_registered_accounts');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
};

const saveRegisteredAccount = (profile: UserProfile, pass: string) => {
  try {
    const accounts = getRegisteredAccounts();
    const key = (profile.email || '').toLowerCase().trim();
    if (key) {
      accounts[key] = {
        profile,
        passHash: pass,
      };
      localStorage.setItem('agritech_registered_accounts', JSON.stringify(accounts));
    }
  } catch {}
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  
  // Clean default guest user when not signed in (clear any previous demo profile)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem('agritech_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) {
          if (isDemoUser(parsed)) {
            localStorage.removeItem('agritech_current_user');
            return GUEST_USER;
          }
          return parsed;
        }
      }
    } catch {}
    return GUEST_USER;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [firestoreOrders, setFirestoreOrders] = useState<OrderTransaction[]>([]);
  const [firestoreComplaints, setFirestoreComplaints] = useState<UserComplaint[]>(() => INITIAL_COMPLAINTS);

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
      }, (_err) => {
        // Quietly maintain local offline state during network transitions
      });

      return () => unsubOrders();
    } catch (_e) {
      // Quietly fall back
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
      }, (_err) => {
        // Quietly maintain local state during offline periods
      });

      return () => unsubComplaints();
    } catch (_e) {
      // Quietly fall back
    }
  }, []);

  const signInAsDemoRole = (role: UserRole) => {
    let targetUser: UserProfile;
    if (role === 'farmer') {
      targetUser = DEMO_USERS.farmer1;
    } else if (role === 'fpo') {
      targetUser = DEMO_USERS.fpo1;
    } else if (role === 'organisation') {
      targetUser = DEMO_USERS.org1;
    } else {
      targetUser = DEMO_USERS.individual1;
    }
    setCurrentUser(targetUser);
    try {
      localStorage.setItem('agritech_current_user', JSON.stringify(targetUser));
    } catch {}
  };

  const signInWithEmail = async (email: string, pass: string, chosenRole?: UserRole) => {
    const cleanEmail = (email || '').trim();
    const lowerEmail = cleanEmail.toLowerCase();
    
    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const user = userCredential.user;
      
      // Load user profile from Firestore 'users' collection
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      let activeProfile: UserProfile;

      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        activeProfile = {
          ...profile,
          id: user.uid,
          email: user.email || cleanEmail,
        };
        if (chosenRole && activeProfile.role !== chosenRole) {
          activeProfile.role = chosenRole;
          await setDoc(userDocRef, removeUndefinedFields({ role: chosenRole }), { merge: true });
        }
      } else {
        const fallbackRole = chosenRole || 'farmer';
        const nameFromEmail = (user.email || cleanEmail).split('@')[0];
        activeProfile = {
          id: user.uid,
          name: user.displayName || nameFromEmail,
          email: user.email || cleanEmail,
          role: fallbackRole,
          ...(fallbackRole === 'farmer' 
            ? { farmName: `${nameFromEmail}'s Agro Farm` } 
            : fallbackRole === 'fpo' 
            ? { orgName: `${nameFromEmail} Farmer Co-op` } 
            : { orgName: `${nameFromEmail} Agri Traders` }),
          location: 'Nashik Agro Hub, Maharashtra',
          verified: true,
          rating: 5.0,
          totalDeals: 0,
          avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
        };
        await setDoc(userDocRef, removeUndefinedFields(activeProfile), { merge: true });
      }

      setCurrentUser(activeProfile);
      try {
        localStorage.setItem('agritech_current_user', JSON.stringify(activeProfile));
        saveRegisteredAccount(activeProfile, pass);
      } catch {}
    } catch (err: any) {
      console.warn('Firebase Email Sign-In issue:', err?.code || err?.message);

      // Check if user account was created in local registry
      const registeredAccounts = getRegisteredAccounts();
      const localAccount = registeredAccounts[lowerEmail];
      if (localAccount) {
        if (localAccount.passHash && localAccount.passHash !== pass) {
          throw new Error('auth/wrong-password');
        }
        const profile = { ...localAccount.profile };
        if (chosenRole) {
          profile.role = chosenRole;
        }
        setCurrentUser(profile);
        try {
          localStorage.setItem('agritech_current_user', JSON.stringify(profile));
        } catch {}
        return;
      }

      // Check if user was saved in agritech_current_user matching this exact typed email
      const savedUserStr = localStorage.getItem('agritech_current_user');
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser.email?.toLowerCase() === lowerEmail && !isDemoUser(savedUser)) {
            if (chosenRole) savedUser.role = chosenRole;
            setCurrentUser(savedUser);
            return;
          }
        } catch {}
      }

      // NEVER EVER log in as demo user if credentials fail! Throw clear error.
      if (
        err?.code === 'auth/user-not-found' || 
        err?.code === 'auth/invalid-credential' || 
        err?.message?.includes('user-not-found') ||
        err?.message?.includes('invalid-credential')
      ) {
        throw new Error('auth/user-not-found');
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
    const cleanEmail = (email || '').trim();
    const cleanName = (name || '').trim();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const user = userCredential.user;
      await updateProfile(user, { displayName: cleanName });

      const newProfile: UserProfile = {
        id: user.uid,
        name: cleanName,
        email: cleanEmail,
        role,
        ...(role === 'farmer' 
          ? { farmName: orgOrFarmName?.trim() || `${cleanName}'s Farm` } 
          : role === 'fpo'
          ? { orgName: orgOrFarmName?.trim() || `${cleanName} Farmer Producer Co-op` }
          : { orgName: orgOrFarmName?.trim() || `${cleanName} Agri Corp` }),
        location: location || (role === 'farmer' ? 'Nashik Agro Belt, Maharashtra' : 'Vashi Mandi Hub, Navi Mumbai'),
        phone: phone || '+91 98000 00000',
        verified: true,
        rating: 5.0,
        totalDeals: 0,
        avatarUrl: role === 'farmer' 
          ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
          : role === 'fpo'
          ? 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      };

      // Save to Firestore without any undefined properties
      await setDoc(doc(db, 'users', user.uid), removeUndefinedFields(newProfile), { merge: true });
      setCurrentUser(newProfile);
      try {
        localStorage.setItem('agritech_current_user', JSON.stringify(newProfile));
        saveRegisteredAccount(newProfile, pass);
      } catch {}
    } catch (err: any) {
      console.warn('Firebase Email Sign-Up issue:', err?.code || err?.message);
      
      // If Email provider is not enabled in Firebase Console (auth/operation-not-allowed) or offline
      if (
        err?.code === 'auth/operation-not-allowed' || 
        err?.message?.includes('operation-not-allowed') ||
        err?.code === 'auth/network-request-failed'
      ) {
        const localUserId = `user_${Date.now()}`;
        const fallbackProfile: UserProfile = {
          id: localUserId,
          name: cleanName,
          email: cleanEmail,
          role,
          ...(role === 'farmer' 
            ? { farmName: orgOrFarmName?.trim() || `${cleanName}'s Farm` } 
            : role === 'fpo'
            ? { orgName: orgOrFarmName?.trim() || `${cleanName} Farmer Producer Co-op` }
            : { orgName: orgOrFarmName?.trim() || `${cleanName} Agri Corp` }),
          location: location || (role === 'farmer' ? 'Nashik Agro Belt, Maharashtra' : 'Vashi Mandi Hub, Navi Mumbai'),
          phone: phone || '+91 98000 00000',
          verified: true,
          rating: 5.0,
          totalDeals: 0,
          avatarUrl: role === 'farmer' 
            ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
            : role === 'fpo'
            ? 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=150&auto=format&fit=crop&q=80'
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
          saveRegisteredAccount(fallbackProfile, pass);
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
      signInAsDemoRole,
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
