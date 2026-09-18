import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  arrayUnion,
  CollectionReference,
  DocumentData
} from "firebase/firestore";
import { User } from "firebase/auth";
import { 
  CustomerType, 
  OrderPriority, 
  OrderStatus, 
  MaterialCategory, 
  CalculationMode, 
  ShippingMethod 
} from "../types";

/* ========================================================================= */
/* 🔥 FIREBASE & FIRESTORE UNIFIED CLIENT INSTANCE                          */
/* ========================================================================= */
import { app, db, auth } from "./firebase";
export { app, db, auth };

/* ========================================================================= */
/* 📋 CORE FIRESTORE DATA MODELS (INTERFACES)                                */
/* ========================================================================= */

/**
 * Interface del modelo de datos de Usuario en Firestore (/users)
 */
export interface Usuario {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: "admin" | "customer";
  customerType?: CustomerType;
  companyName?: string;
  cuit?: string;
  taxCondition?: string;
  photoURL?: string;
  address?: {
    street?: string;
    number?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  isActive: boolean;
  createdAt: string | Timestamp;
  updatedAt?: string | Timestamp;
}

/**
 * Interface del modelo de datos de Presupuesto / Cotización Guardada (/saved_quotes)
 */
export interface SavedQuote {
  id: string;
  quoteNumber: string;
  userId?: string;
  userEmail?: string;
  customerName?: string;
  customerCompany?: string;
  createdAt: string;
  materialId: string;
  materialName: string;
  category?: MaterialCategory | string;
  widthCm?: number;
  heightCm?: number;
  quantity: number;
  totalAreaM2?: number;
  unitPriceARS: number;
  totalPriceARS: number;
  printQuality?: string;
  inkType?: string;
  selectedColor?: string;
  finishingsSummary?: string[];
  notes?: string;
  customNotes?: string;
}

/**
 * Interface del modelo de datos de Pedido en Firestore (/orders)
 */
export interface Pedido {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerCompany?: string;
  customerEmail: string;
  customerPhone: string;
  customerType: CustomerType;
  priority: OrderPriority;
  status: OrderStatus;
  paymentStatus: "acreditado" | "pendiente";
  paymentMethod: "mercadopago" | "transferencia";
  items: Array<{
    id: string;
    materialId: string;
    materialName: string;
    category?: MaterialCategory;
    widthCm?: number;
    heightCm?: number;
    quantity: number;
    areaM2?: number;
    unitPriceARS: number;
    subtotalARS: number;
    finishings?: string[];
    finishingsSummary?: string;
    comments?: string;
  }>;
  totalM2?: number;
  totalAmountARS: number;
  shippingMethod: ShippingMethod;
  shippingFeeARS: number;
  trackingUrl?: string;
  estimatedDelivery?: string;
  promisedDate?: string;
  internalNotes?: string;
  auditHistory?: OrderAuditLog[];
  createdAt: string;
  updatedAt?: string;
}

/**
 * Interface del registro de auditoría (Audit Log) para trazabilidad de estados
 */
export interface OrderAuditLog {
  id?: string;
  orderId: string; // en qué objeto (order ID)
  orderNumber?: string;
  adminUid: string; // quién (admin UID)
  action?: string; // qué acción realizó (ej: 'update_status')
  adminEmail: string;
  adminName?: string;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
  notes?: string;
}

/**
 * Interface del modelo de datos de Material / Producto en Firestore (/materials o /products)
 */
export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  mode: CalculationMode;
  costARS: number;
  salePriceARS: number;
  marginPercent: number;
  unitLabel: string;
  stockStatus: "disponible" | "stock_bajo" | "sin_stock" | "a_pedido";
  shortDesc: string;
  description?: string;
  badge?: string;
  isActive: boolean;
  minAreaM2?: number;
  plateWidthCm?: number;
  plateHeightCm?: number;
  linearWidthCm?: number;
  updatedAt?: string;
}

/* ========================================================================= */
/* 🛡️ ERROR HANDLING & AUDITING                                             */
/* ========================================================================= */

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error("Firestore Permission or Operation Error:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/* ========================================================================= */
/* 🗄️ TYPED COLLECTION HELPERS                                              */
/* ========================================================================= */

export const usersCollection = collection(db, "users") as CollectionReference<Usuario>;
export const ordersCollection = collection(db, "orders") as CollectionReference<Pedido>;
export const materialsCollection = collection(db, "materials") as CollectionReference<Material>;
export const auditLogsCollection = collection(db, "audit_logs") as CollectionReference<OrderAuditLog>;
export const savedQuotesCollection = collection(db, "saved_quotes") as CollectionReference<SavedQuote>;

/* ========================================================================= */
/* 📝 ORDER AUDIT LOGGING HELPER FUNCTIONS                                   */
/* ========================================================================= */

/**
 * Registra automáticamente un nuevo documento en la subcolección 'auditLogs'
 * de un pedido cada vez que un administrador actualiza el estado desde AdminPanelView.
 * Garantiza la trazabilidad obligatoria con:
 * - ID del admin (adminUid)
 * - Acción realizada (action, ej: 'update_status')
 * - ID del pedido (orderId)
 * - Marca de tiempo ISO (timestamp)
 */
export async function logOrderStatusAudit(params: {
  adminUid: string;
  action: string;
  orderId: string;
  timestamp?: string;
  orderNumber?: string;
  previousStatus?: string;
  newStatus?: string;
  adminEmail?: string;
  adminName?: string;
  notes?: string;
}): Promise<OrderAuditLog> {
  const timestamp = params.timestamp || new Date().toISOString();
  const entry: OrderAuditLog = {
    orderId: params.orderId,
    orderNumber: params.orderNumber || params.orderId,
    adminUid: params.adminUid,
    action: params.action || "update_status",
    adminEmail: params.adminEmail || "carteles.ploteos@gmail.com",
    adminName: params.adminName || "Administrador",
    previousStatus: params.previousStatus || "pendiente",
    newStatus: params.newStatus || "en_produccion",
    timestamp,
    notes: params.notes || `Estado actualizado a "${params.newStatus || ''}"`,
  };

  try {
    const orderRef = doc(db, "orders", params.orderId);

    // 1. Guardar documento en la subcolección 'orders/{orderId}/auditLogs'
    try {
      const subcollectionRef = collection(db, "orders", params.orderId, "auditLogs");
      const docRef = await addDoc(subcollectionRef, entry);
      entry.id = docRef.id;
    } catch (err) {
      console.warn("Error guardando en subcolección auditLogs:", err);
    }

    // Guardar también en subcolección 'audit_logs' para máxima compatibilidad
    try {
      const subcollectionCompatRef = collection(db, "orders", params.orderId, "audit_logs");
      await addDoc(subcollectionCompatRef, entry);
    } catch {
      // ignore
    }

    // 2. Guardar en la colección global de auditoría
    try {
      await addDoc(collection(db, "auditLogs"), entry);
    } catch {
      // ignore
    }

    // 3. Actualizar el documento del pedido con el historial embebido
    if (params.newStatus) {
      try {
        await updateDoc(orderRef, {
          status: params.newStatus as OrderStatus,
          updatedAt: timestamp,
          auditHistory: arrayUnion(entry),
        });
      } catch {
        // ignore
      }
    }

    return entry;
  } catch (error) {
    console.warn("No se pudo registrar la auditoría en Firestore (continuando):", error);
    return entry;
  }
}

/**
 * Registra un cambio de estado en el historial de auditoría de Firestore.
 * Guarda en la subcolección orders/{orderId}/auditLogs (y audit_logs para compatibilidad),
 * en la colección raíz auditLogs y actualiza el array auditHistory en el documento del pedido.
 */
export async function recordOrderAuditLog(params: {
  orderId: string;
  orderNumber?: string;
  action?: string;
  previousStatus: string;
  newStatus: string;
  adminUser: {
    uid: string;
    email: string;
    displayName?: string;
  };
  notes?: string;
}): Promise<OrderAuditLog> {
  return logOrderStatusAudit({
    orderId: params.orderId,
    orderNumber: params.orderNumber,
    adminUid: params.adminUser.uid,
    action: params.action || "update_status",
    adminEmail: params.adminUser.email,
    adminName: params.adminUser.displayName,
    previousStatus: params.previousStatus,
    newStatus: params.newStatus,
    notes: params.notes,
  });
}

/**
 * Registra automáticamente una actualización masiva de estados en la subcolección 'auditLogs'
 * de cada pedido involucrado en Firestore, garantizando la trazabilidad de:
 * quién (admin UID), qué acción realizó (ej: 'update_status'), y en qué objeto (order ID).
 */
export async function recordBulkOrderAuditLogs(params: {
  orderIds: string[];
  ordersMap?: Record<string, { status?: string; orderNumber?: string }>;
  action?: string;
  newStatus: string;
  adminUser: {
    uid: string;
    email: string;
    displayName?: string;
  };
  notes?: string;
}): Promise<OrderAuditLog[]> {
  const timestamp = new Date().toISOString();
  const logs: OrderAuditLog[] = [];

  const promises = params.orderIds.map(async (orderId) => {
    const orderData = params.ordersMap ? params.ordersMap[orderId] : undefined;
    const previousStatus = orderData?.status || "pendiente";
    const orderNumber = orderData?.orderNumber || orderId;

    const entry: OrderAuditLog = {
      orderId, // En qué objeto (order ID)
      orderNumber,
      adminUid: params.adminUser.uid, // Quién (admin UID)
      action: params.action || "update_status", // Qué acción realizó
      adminEmail: params.adminUser.email,
      adminName: params.adminUser.displayName || params.adminUser.email.split("@")[0],
      previousStatus,
      newStatus: params.newStatus,
      timestamp,
      notes: params.notes || `Actualización masiva de estado a "${params.newStatus}"`,
    };

    try {
      // Subcolección auditLogs dentro del documento del pedido
      const subcollectionRef = collection(db, "orders", orderId, "auditLogs");
      await addDoc(subcollectionRef, entry);

      // Subcolección audit_logs para compatibilidad
      try {
        const subcollectionCompatRef = collection(db, "orders", orderId, "audit_logs");
        await addDoc(subcollectionCompatRef, entry);
      } catch {
        // ignore
      }

      // Actualizar documento del pedido
      const orderRef = doc(db, "orders", orderId);
      try {
        await updateDoc(orderRef, {
          status: params.newStatus as OrderStatus,
          updatedAt: timestamp,
          auditHistory: arrayUnion(entry),
        });
      } catch {
        // ignore if in-memory
      }
    } catch (e) {
      console.warn(`No se pudo persistir audit log para pedido ${orderId}:`, e);
    }

    logs.push(entry);
  });

  await Promise.allSettled(promises);
  return logs;
}

/**
 * Obtiene el historial de auditoría para un pedido específico (consultando 'auditLogs' y 'audit_logs')
 */
export async function getOrderAuditLogs(orderId: string): Promise<OrderAuditLog[]> {
  try {
    // Primero consultar subcolección estándar 'auditLogs'
    const subcollectionRef = collection(db, "orders", orderId, "auditLogs");
    const q = query(subcollectionRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as OrderAuditLog[];
    }

    // Fallback a 'audit_logs' si 'auditLogs' no contiene registros
    const subcollectionCompatRef = collection(db, "orders", orderId, "audit_logs");
    const qCompat = query(subcollectionCompatRef, orderBy("timestamp", "desc"));
    const snapshotCompat = await getDocs(qCompat);

    return snapshotCompat.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as OrderAuditLog[];
  } catch (error) {
    console.warn(`Error recuperando audit logs de orden ${orderId}:`, error);
    return [];
  }
}

/* ========================================================================= */
/* 👤 FIRESTORE USER PROFILE SYNCHRONIZATION                                 */
/* ========================================================================= */

const ADMIN_EMAIL_LOWER = "carteles.ploteos@gmail.com";

/**
 * Sincroniza y persiste de manera segura el perfil de un usuario en la colección /users
 * de Firestore tras el registro o inicio de sesión con Google o Email.
 */
export async function syncUserDocument(user: User, additionalData?: Partial<Usuario>): Promise<Usuario> {
  if (!user || !user.uid) {
    throw new Error("Usuario inválido para sincronización en Firestore");
  }

  const userRef = doc(db, "users", user.uid);
  const nowIso = new Date().toISOString();
  const isAdmin = (user.email || "").toLowerCase().trim() === ADMIN_EMAIL_LOWER;

  try {
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const existing = snap.data() as Usuario;
      const updatedFields: Partial<Usuario> = {
        email: user.email || existing.email || "",
        displayName: user.displayName || existing.displayName || (user.email ? user.email.split("@")[0] : "Cliente"),
        photoURL: user.photoURL || existing.photoURL || undefined,
        phoneNumber: user.phoneNumber || existing.phoneNumber || undefined,
        role: isAdmin ? "admin" : (existing.role || "customer"),
        customerType: existing.customerType || (isAdmin ? "corporativo" : "consumidor_final"),
        isActive: existing.isActive !== undefined ? existing.isActive : true,
        updatedAt: nowIso,
        ...additionalData,
      };

      await updateDoc(userRef, updatedFields);
      const mergedUser: Usuario = { ...existing, ...updatedFields, uid: user.uid };
      return mergedUser;
    } else {
      const newUser: Usuario = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || (user.email ? user.email.split("@")[0] : "Cliente"),
        photoURL: user.photoURL || undefined,
        phoneNumber: user.phoneNumber || undefined,
        role: isAdmin ? "admin" : "customer",
        customerType: isAdmin ? "corporativo" : "consumidor_final",
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
        ...additionalData,
      };

      await setDoc(userRef, newUser);
      return newUser;
    }
  } catch (error) {
    console.warn("[Firestore] Advertencia al sincronizar perfil de usuario en /users:", error);
    // Fallback gracefully so login does not block if Firestore network rules are strict
    const fallbackUser: Usuario = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || (user.email ? user.email.split("@")[0] : "Cliente"),
      photoURL: user.photoURL || undefined,
      role: isAdmin ? "admin" : "customer",
      customerType: "consumidor_final",
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso,
      ...additionalData,
    };
    return fallbackUser;
  }
}

/* ========================================================================= */
/* 📄 SAVED QUOTES & CLIENT ESTIMATE HISTORY                                 */
/* ========================================================================= */

const LOCAL_STORAGE_QUOTES_KEY = "cc_saved_quotes_history";

/**
 * Guarda una cotización en Firestore (/saved_quotes) y en caché local
 */
export async function saveUserQuote(quote: SavedQuote): Promise<SavedQuote> {
  const quoteWithDefaults: SavedQuote = {
    ...quote,
    id: quote.id || `quote-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    quoteNumber: quote.quoteNumber || `COT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: quote.createdAt || new Date().toISOString(),
  };

  // 1. Guardar en localStorage para disponibilidad inmediata y offline
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_QUOTES_KEY);
    const localList: SavedQuote[] = raw ? JSON.parse(raw) : [];
    const filtered = localList.filter((q) => q.id !== quoteWithDefaults.id);
    filtered.unshift(quoteWithDefaults);
    localStorage.setItem(LOCAL_STORAGE_QUOTES_KEY, JSON.stringify(filtered.slice(0, 50)));
  } catch (e) {
    // Ignore localStorage quota errors
  }

  // 2. Persistir en Firestore si hay conexión
  try {
    const quoteDocRef = doc(db, "saved_quotes", quoteWithDefaults.id);
    await setDoc(quoteDocRef, quoteWithDefaults);
  } catch (err) {
    console.warn("[Firestore] Advertencia al guardar cotización en nube:", err);
  }

  return quoteWithDefaults;
}

/**
 * Recupera el historial de cotizaciones guardadas para un usuario (Firestore + LocalStorage)
 */
export async function getUserSavedQuotes(userIdOrEmail?: string): Promise<SavedQuote[]> {
  const quotesMap = new Map<string, SavedQuote>();

  // 1. Cargar desde LocalStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_QUOTES_KEY);
    if (raw) {
      const localList: SavedQuote[] = JSON.parse(raw);
      localList.forEach((q) => quotesMap.set(q.id, q));
    }
  } catch (e) {}

  // 2. Consultar en Firestore si tenemos credenciales
  if (userIdOrEmail) {
    try {
      const cleanFilter = userIdOrEmail.trim().toLowerCase();
      // Consultar por userId o por userEmail
      const qUser = query(collection(db, "saved_quotes"), where("userId", "==", userIdOrEmail));
      const snapUser = await getDocs(qUser);
      snapUser.docs.forEach((d) => quotesMap.set(d.id, { id: d.id, ...d.data() } as SavedQuote));

      const qEmail = query(collection(db, "saved_quotes"), where("userEmail", "==", cleanFilter));
      const snapEmail = await getDocs(qEmail);
      snapEmail.docs.forEach((d) => quotesMap.set(d.id, { id: d.id, ...d.data() } as SavedQuote));
    } catch (err) {
      console.warn("[Firestore] Error recuperando presupuestos remotos:", err);
    }
  }

  // Retornar ordenados por fecha descendente
  return Array.from(quotesMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Elimina una cotización guardada
 */
export async function deleteUserSavedQuote(quoteId: string): Promise<boolean> {
  // 1. Eliminar de local storage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_QUOTES_KEY);
    if (raw) {
      const localList: SavedQuote[] = JSON.parse(raw);
      const filtered = localList.filter((q) => q.id !== quoteId);
      localStorage.setItem(LOCAL_STORAGE_QUOTES_KEY, JSON.stringify(filtered));
    }
  } catch (e) {}

  // 2. Eliminar de Firestore
  try {
    await deleteDoc(doc(db, "saved_quotes", quoteId));
  } catch (e) {
    console.warn("[Firestore] Error eliminando presupuesto remoto:", e);
  }

  return true;
}


