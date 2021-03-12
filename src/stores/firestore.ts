import firebase from 'firebase/app';
import "firebase/firestore";
import "firebase/auth";
import { FirebaseConfig } from "../config/plugin-config";
import * as PluginAPI from "@concord-consortium/lara-plugin-api";
import { IInteractiveAvailableEvent } from "@concord-consortium/lara-plugin-api";

export interface SharedClassData {
  type: "demo" | "test" | "lara";
  interactiveName: string;
  currentUserIsShared: boolean;
  students: SharedStudentData[];
}

export type SharedStudentFirestoreData = SharedStudentFirestoreDataV1;

export interface SharedStudentFirestoreDataV1 {
  version?: 1;
  userId: string;
  iframeUrl: string;
}

export interface SharedStudentData extends SharedStudentFirestoreData {
  displayName: string;
  isCurrentUser: boolean
}

// maps userId to displayName
export interface SharedClassUserMap {
  [key: string]: string | undefined;
}

export interface InitDemoFirestoreParams {
  type: "demo";
}

export interface InitTestFirestoreParams {
  type: "test";
}

export interface InitLaraFirestoreParams {
  type: "lara";
  rawFirebaseJWT: string;
  portalDomain: string;
  offeringId: string;
  classHash: string;
  pluginId: string;
  portalUserId: string;
  userMap: SharedClassUserMap;
  interactiveName: string;
  interactiveAvailable: boolean;
  onInteractiveAvailable: (handler: PluginAPI.IInteractiveAvailableEventHandler) => void;
  getReportingUrl: () => Promise<string | null> | null;
}

export type InitFirestoreParams = InitDemoFirestoreParams | InitTestFirestoreParams | InitLaraFirestoreParams;

interface CurrentUserInfo {
  userId: string;
  docRef: firebase.firestore.DocumentReference;
  displayName: string;
}

export type FirestoreStoreListener = (sharedClassData: SharedClassData | null) => void;
export type FirestoreStoreCancelListener = () => void;

export type InteractiveAvailableListener = (available: boolean) => void;

export class FirestoreStore {
  public readonly type: "demo" | "test" | "lara";
  public interactiveAvailable: boolean = true;
  public getReportingUrl: () => Promise<string | null> | null;
  private initialized: boolean;
  private listeners: FirestoreStoreListener[];
  private db: firebase.firestore.Firestore;
  private classData: SharedClassData | null;
  private currentUser: CurrentUserInfo | null;
  private userMap: SharedClassUserMap;
  private interactiveAvailableListeners: InteractiveAvailableListener[];

  constructor() {
    this.initialized = false;
    this.listeners = [];
    this.classData = null;
    this.currentUser = null;
    this.userMap = {};
    this.interactiveAvailableListeners = [];

    firebase.initializeApp(FirebaseConfig);

    this.db = firebase.firestore();
    const settings = {};
    this.db.settings(settings);
  }

  public init(params: InitFirestoreParams) {
    return new Promise<void>((resolve, reject) => {
      if (this.initialized) {
        return reject("Firestore store already initialized!");
      }
      this.initialized = true;

      const interactiveName =
        params.type === "demo" ? "Demo Interactive" : (
        params.type === "test" ? "Test Interactive" :
        params.interactiveName
      );
      const classData: SharedClassData = this.classData = {
        type: params.type,
        currentUserIsShared: false,
        interactiveName,
        students: []
      };

      switch (params.type) {
        case "demo":
          this.login()
            .then(() => {
              const studentDemoData = this.createDemoData();
              this.listenForChanges(studentDemoData).then(resolve).catch(reject);
            })
            .catch(reject);
          break;

        case "test":
          // TODO: figure out how to handle tests - use fake firestore? - for now just notify with no students
          this.notifyListeners();
          resolve();
          break;

        case "lara":
          this.getReportingUrl = params.getReportingUrl;

          this.interactiveAvailable = params.interactiveAvailable;
          params.onInteractiveAvailable(this.handleInteractiveAvailable);

          this.login(params.rawFirebaseJWT)
            .then(() => {
              this.userMap = params.userMap;
              const userId = params.portalUserId;
              const portalDomain = params.portalDomain.replace(/\//g, "-");
              const path = `portals/${portalDomain}/classes/${params.classHash}/offerings/${params.offeringId}/plugins/${params.pluginId}/studentData`;
              const pluginData = this.db.collection(path);
              this.currentUser = {
                userId,
                displayName: params.userMap[userId] || "Unknown User",
                docRef: pluginData.doc(userId),
              };
              this.listenForChanges(pluginData).then(resolve).catch(reject);
            })
            .catch(reject);
          break;
      }
    });
  }

  public listen(listener: FirestoreStoreListener): FirestoreStoreCancelListener {
    this.ensureInitalized();
    this.listeners.push(listener);
    listener(this.classData);
    return () => {
      this.listeners.splice(this.listeners.indexOf(listener), 1);
    };
  }

  public toggleShare(iframeUrl: string) {
    this.ensureInitalized();
    if (this.classData) {
      if (this.classData.currentUserIsShared) {
        this.unshare();
        return false;
      }
      else {
        this.share(iframeUrl);
        return true;
      }
    }
    return false;
  }

  public share(iframeUrl: string) {
    this.ensureInitalized();
    if (this.currentUser) {
      const { userId } = this.currentUser;
      const student: SharedStudentFirestoreData = {
        version: 1,
        userId,
        iframeUrl
      };
      this.currentUser.docRef.set(student);
    }
  }

  public unshare() {
    this.ensureInitalized();
    if (this.currentUser) {
      return this.currentUser.docRef.delete();
    }
  }

  public listenForInteractiveAvailable(listener: InteractiveAvailableListener) {
    this.interactiveAvailableListeners.push(listener);
  }

  private ensureInitalized() {
    if (!this.initialized) {
      throw new Error("Firestore store not initialized!");
    }
  }

  private listenForChanges(collection: firebase.firestore.CollectionReference) {
    return new Promise<void>((resolve, reject) => {
      const classData = this.classData;
      if (!classData) {
        return reject("classData not defined before listenForChanges called");
      }

      let firstSnapshot = true;
      collection.onSnapshot((snapshot) => {

        // get the updated student data
        const currentUserId = this.currentUser ? this.currentUser.userId : null;
        classData.currentUserIsShared = false;
        classData.students = [];
        snapshot.forEach((doc) => {
          const studentData = doc.data() as SharedStudentFirestoreData;
          const { userId, iframeUrl } = studentData;
          if (userId === currentUserId) {
            classData.currentUserIsShared = true;
          }

          const displayName = this.userMap[userId];
          if (displayName) {
            classData.students.push({
              userId,
              displayName,
              iframeUrl,
              isCurrentUser: userId === currentUserId,
            });
          }
        });

        // sort by display name
        classData.students.sort((a, b) => a.displayName < b.displayName ? -1 : (a.displayName > b.displayName ? 1 : 0));

        this.notifyListeners();

        if (firstSnapshot) {
          firstSnapshot = false;
          resolve();
        }
      }, (err) => reject(err));
    });
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      listener(this.classData);
    });
  }

  private login(rawFirebaseJWT?: string) {
    return new Promise<void>((resolve, reject) => {
      firebase.auth().signOut().then(() => {
        firebase.auth().onAuthStateChanged((firebaseUser) => {
          if (firebaseUser) {
            resolve();
          }
        });

        if (rawFirebaseJWT) {
          firebase.auth().signInWithCustomToken(rawFirebaseJWT).catch(reject);
        }
        else {
          firebase.auth().signInAnonymously().catch(reject);
        }
      })
      .catch(reject);
    });
  }

  private createDemoData() {
    const studentDemoData = this.db.collection("studentDemoData");

    // delete the current user's demo data
    let userId = "1@demo";
    this.userMap[userId] = "Alvaro, Tameka";
    this.currentUser = {
      userId,
      displayName: "Alvaro, Tameka",
      docRef: studentDemoData.doc(userId),
    };
    this.unshare();

    const iframeUrl = "https://sagemodeler.concord.org/branch/master/?launchFromLara=eyJyZWNvcmRpZCI6ODMwMTYsImFjY2Vzc0tleXMiOnsicmVhZE9ubHkiOiI5YTQzMjdhYmE0NGZlOTJlYzhiMDkxNWM0MjA1OWYwZGY1MThmMTdmIn19";

    userId = "2@demo";
    let sharedStudentData: SharedStudentFirestoreData = {
      userId,
      iframeUrl
    };
    studentDemoData.doc(userId).set(sharedStudentData);
    this.userMap[userId] = "Longlonglastname, Marie-Marie";

    // create demo data for all fake students except for the current user
    for (let i = 3; i <= 26; i++) {
      userId = `${i}@demo`;
      sharedStudentData = {
        userId,
        iframeUrl
      };
      studentDemoData.doc(userId).set(sharedStudentData);
      this.userMap[userId] = `Student ${String.fromCharCode(63 + i)}`;
    }

    return studentDemoData;
  }

  private handleInteractiveAvailable = (event: IInteractiveAvailableEvent) => {
    this.interactiveAvailable = event.available;
    this.interactiveAvailableListeners.forEach((listener) => {
      listener(this.interactiveAvailable);
    });
  }

}

export const store = new FirestoreStore();
