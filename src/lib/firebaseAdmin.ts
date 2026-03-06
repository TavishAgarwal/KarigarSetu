/**
 * Firebase Admin SDK initialization.
 * Used for server-side Firebase operations: token verification, user management.
 *
 * Supports multiple credential formats:
 * 1. Individual env vars (FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY)
 * 2. JSON blob (FIREBASE_ADMIN_SDK_JSON)
 * 3. ADC file (GOOGLE_APPLICATION_CREDENTIALS)
 *
 * SERVER-SIDE ONLY — never import from client components.
 */
import * as admin from 'firebase-admin';

let adminApp: admin.app.App | null = null;

/** Cache parsed Firebase Admin JSON credentials. */
let _cachedFirebaseConfig: { projectId: string; clientEmail: string; privateKey: string } | null = null;
let _firebaseConfigParsed = false;

/**
 * Parse the FIREBASE_ADMIN_SDK_JSON env var (JSON blob).
 */
function parseFirebaseAdminJson(): { projectId: string; clientEmail: string; privateKey: string } | null {
    if (_firebaseConfigParsed) return _cachedFirebaseConfig;
    _firebaseConfigParsed = true;

    const jsonStr = process.env.FIREBASE_ADMIN_SDK_JSON;
    if (!jsonStr) return null;

    try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.project_id && parsed.client_email && parsed.private_key) {
            _cachedFirebaseConfig = {
                projectId: parsed.project_id,
                clientEmail: parsed.client_email,
                privateKey: parsed.private_key.replace(/\\n/g, '\n'),
            };
            return _cachedFirebaseConfig;
        }
    } catch (error) {
        console.error('[FirebaseAdmin] Failed to parse FIREBASE_ADMIN_SDK_JSON:', error);
    }

    return null;
}

/**
 * Get or create a Firebase Admin app instance (singleton).
 */
export function getFirebaseAdmin(): admin.app.App {
    if (adminApp) return adminApp;

    // Priority 1: Individual env vars
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        adminApp = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        return adminApp;
    }

    // Priority 2: JSON blob
    const jsonConfig = parseFirebaseAdminJson();
    if (jsonConfig) {
        adminApp = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: jsonConfig.projectId,
                clientEmail: jsonConfig.clientEmail,
                privateKey: jsonConfig.privateKey,
            }),
        });
        return adminApp;
    }

    // Priority 3: ADC file
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        adminApp = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
        return adminApp;
    }

    throw new Error(
        'Firebase Admin credentials not configured. ' +
        'Set FIREBASE_ADMIN_SDK_JSON, or individual FIREBASE_ADMIN_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY vars.'
    );
}

/**
 * Check if Firebase Admin SDK is configured (used by feature flags).
 */
export function isFirebaseAdminConfigured(): boolean {
    return !!(
        (process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) ||
        process.env.FIREBASE_ADMIN_SDK_JSON ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS
    );
}

/**
 * Verify a Firebase ID token from the client.
 * Returns the decoded token with user information.
 */
export async function verifyFirebaseToken(
    idToken: string
): Promise<admin.auth.DecodedIdToken | null> {
    try {
        const app = getFirebaseAdmin();
        const auth = admin.auth(app);
        const decoded = await auth.verifyIdToken(idToken);
        return decoded;
    } catch (error) {
        console.error('[FirebaseAdmin] Token verification failed:', error);
        return null;
    }
}

/**
 * Get Firebase user by UID.
 */
export async function getFirebaseUser(
    uid: string
): Promise<admin.auth.UserRecord | null> {
    try {
        const app = getFirebaseAdmin();
        const auth = admin.auth(app);
        return await auth.getUser(uid);
    } catch (error) {
        console.error('[FirebaseAdmin] Get user failed:', error);
        return null;
    }
}

/**
 * Get Firestore instance for server-side operations.
 */
export function getAdminFirestore(): admin.firestore.Firestore {
    const app = getFirebaseAdmin();
    return admin.firestore(app);
}
