import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, DocumentData } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom databaseId provided in the config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('[FIREBASE_DIAGNOSTIC_LOG] Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface SavedDigest {
  id?: string;
  topic: string;
  timestamp: number; // UTC timestamp
  researcherFindings: {
    source: string;
    keyPoint: string;
    excerpt: string;
  }[];
  editorDigest: {
    intro: string;
    bullets: string[];
    takeaway: string;
  };
}

const COLLECTION_NAME = "digests";

/**
 * Saves a generated research digest to Firestore
 */
export async function saveDigest(
  topic: string,
  researcherFindings: SavedDigest["researcherFindings"],
  editorDigest: SavedDigest["editorDigest"]
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      topic,
      timestamp: Date.now(),
      researcherFindings,
      editorDigest,
    });
    console.log("[FIREBASE] Saved digest successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[FIREBASE] Error saving research digest:", error);
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    throw error;
  }
}

/**
 * Retrieves the history of research digests from Firestore, sorted by newest first
 */
export async function getDigestsHistory(maxLimit = 50): Promise<SavedDigest[]> {
  try {
    const digestsRef = collection(db, COLLECTION_NAME);
    const q = query(digestsRef, orderBy("timestamp", "desc"), limit(maxLimit));
    const querySnapshot = await getDocs(q);
    
    const history: SavedDigest[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      history.push({
        id: doc.id,
        topic: data.topic || "Unknown Topic",
        timestamp: data.timestamp || Date.now(),
        researcherFindings: data.researcherFindings || [],
        editorDigest: data.editorDigest || { intro: "", bullets: [], takeaway: "" },
      });
    });
    return history;
  } catch (error) {
    console.error("[FIREBASE] Error fetching history from Firestore:", error);
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return [];
  }
}

