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

interface PhoneOtpSession {
  phoneNumber: string;
  otpCode: string;
  expiresAt: number;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  loading: boolean;
  isFirebaseConnected: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role: UserRole, location: string, orgOrFarmName?: string, phone?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPhoneOtp: (phoneNumber: string) => Promise<{ success: boolean; otp: string }>;
  verifyPhoneOtpAndSignIn: (phoneNumber: string, otp: string, registrationData?: { name?: string; role?: UserRole; location?: string; orgOrFarmName?: string }) => Promise<void>;
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
  // Default to Demo User (e.g. farmer1 or org1) if not logged in
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS.farmer1);
  const [loading, setLoading] = useState<boolean>(true);
  const [firestoreOrders, setFirestoreOrders] = useState<OrderTransaction[]>([]);
  const [firestoreComplaints, setFirestoreComplaints] = useState<UserComplaint[]>([]);
  const [activeOtpSession, setActiveOtpSession] = useState<PhoneOtpSession | null>(null);

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
              name: user.displayName || user.email?.split('@')[0] || 'Agritech Bharat Member',
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
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    // Load doc
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      setCurrentUser(snap.data() as UserProfile);
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
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setCurrentUser({
          ...data,
          id: user.uid,
          email: user.email || data.email,
        });
      } else {
        const newProfile: UserProfile = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Agritech Bharat Member',
          email: user.email || 'user@agritech-bharat.in',
          role: 'organisation', // Default to B2B Procurement Buyer or customizable
          orgName: `${user.displayName || 'Google'} Procurement Enterprise`,
          location: 'New Delhi / National Capital Mandi',
          verified: true,
          rating: 5.0,
          totalDeals: 0,
          avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          phone: user.phoneNumber || '+91 98110 54321',
        };

        await setDoc(userDocRef, removeUndefinedFields(newProfile), { merge: true });
        setCurrentUser(newProfile);
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  };

  const sendPhoneOtp = async (phoneNumber: string): Promise<{ success: boolean; otp: string }> => {
    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    if (cleanNumber.length < 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const session: PhoneOtpSession = {
      phoneNumber: cleanNumber,
      otpCode: generatedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    setActiveOtpSession(session);
    return { success: true, otp: generatedOtp };
  };

  const verifyPhoneOtpAndSignIn = async (
    phoneNumber: string, 
    otp: string,
    registrationData?: { name?: string; role?: UserRole; location?: string; orgOrFarmName?: string }
  ) => {
    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    const cleanOtp = otp.trim();

    // Verify OTP against active session or demo master code
    const isMasterOtp = cleanOtp === '123456' || cleanOtp === '654321';
    const isSessionValid = activeOtpSession && 
      activeOtpSession.phoneNumber === cleanNumber && 
      activeOtpSession.otpCode === cleanOtp && 
      activeOtpSession.expiresAt > Date.now();

    if (!isMasterOtp && !isSessionValid) {
      throw new Error('Invalid or expired OTP code. Please enter the code sent to your phone or use test code 123456.');
    }

    // Generate deterministic ID for this phone number
    const phoneUserId = `phone_${cleanNumber.replace(/[^0-9]/g, '').slice(-10)}`;
    
    try {
      const userDocRef = doc(db, 'users', phoneUserId);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const existingData = snap.data() as UserProfile;
        setCurrentUser({
          ...existingData,
          id: phoneUserId,
        });
      } else {
        const role = registrationData?.role || 'farmer';
        const name = registrationData?.name?.trim() || `Kisan (${cleanNumber.slice(-4)})`;
        const location = registrationData?.location?.trim() || 'Indore Mandi Belt, MP';
        
        const newProfile: UserProfile = {
          id: phoneUserId,
          name,
          email: `${phoneUserId}@kisan.agritechbharat.in`,
          phone: cleanNumber.startsWith('+') ? cleanNumber : `+91 ${cleanNumber}`,
          role,
          ...(role === 'farmer' 
            ? { farmName: registrationData?.orgOrFarmName?.trim() || `${name}'s FPO & Farm` } 
            : { orgName: registrationData?.orgOrFarmName?.trim() || `${name} Commodities Ltd` }),
          location,
          verified: true,
          rating: 4.9,
          totalDeals: 1,
          avatarUrl: role === 'farmer' 
            ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        };

        await setDoc(userDocRef, removeUndefinedFields(newProfile), { merge: true });
        setCurrentUser(newProfile);
      }
    } catch (e) {
      console.warn('Firestore phone profile save fallback to local state:', e);
      const role = registrationData?.role || 'farmer';
      const name = registrationData?.name?.trim() || `Kisan (${cleanNumber.slice(-4)})`;
      const fallbackProfile: UserProfile = {
        id: phoneUserId,
        name,
        email: `${phoneUserId}@kisan.agritechbharat.in`,
        phone: cleanNumber.startsWith('+') ? cleanNumber : `+91 ${cleanNumber}`,
        role,
        farmName: `${name}'s FPO & Farm`,
        location: registrationData?.location || 'Indore Mandi Belt, MP',
        verified: true,
        rating: 4.9,
        totalDeals: 1,
        avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
      };
      setCurrentUser(fallbackProfile);
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
    setCurrentUser(DEMO_USERS.farmer1);
  };

  const saveUserProfile = async (profileUpdate: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...profileUpdate };
    setCurrentUser(updated);

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
      loading,
      isFirebaseConnected: true,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      sendPhoneOtp,
      verifyPhoneOtpAndSignIn,
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
