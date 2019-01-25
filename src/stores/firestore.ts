import * as firebase from "firebase";
// import "firebase/firebase-firestore";

export interface SharedClassData {
  interactiveName: string;
  clickToPlayId: string | null;
  currentUserIsShared: boolean;
  students: SharedStudentData[];
}

export interface SharedStudentFirestoreData {
  userId: string;
  iframeUrl: string;
}

export interface SharedStudentData extends SharedStudentFirestoreData {
  displayName: string;
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
  clickToPlayId: string;
}

export type InitFirestoreParams = InitDemoFirestoreParams | InitTestFirestoreParams | InitLaraFirestoreParams;

interface CurrentUserInfo {
  userId: string;
  docRef: firebase.firestore.DocumentReference;
  displayName: string;
}

export type FirestoreStoreListener = (sharedClassData: SharedClassData | null) => void;
export type FirestoreStoreCancelListener = () => void;

export class FirestoreStore {
  public readonly type: "demo" | "test" | "lara";
  private initialized: boolean;
  private listeners: FirestoreStoreListener[];
  private db: firebase.firestore.Firestore;
  private classData: SharedClassData | null;
  private currentUser: CurrentUserInfo | null;
  private userMap: SharedClassUserMap;

  constructor() {
    this.initialized = false;
    this.listeners = [];
    this.classData = null;
    this.currentUser = null;
    this.userMap = {};

    const config = {
      apiKey: "AIzaSyCGQEmbWr4yP7ZBw-ZjmkfRU1lJNgKLikY",
      authDomain: "share-plugin-dev.firebaseapp.com",
      databaseURL: "https://share-plugin-dev.firebaseio.com",
      projectId: "share-plugin-dev",
      storageBucket: "share-plugin-dev.appspot.com",
      messagingSenderId: "449409198581"
    };
    firebase.initializeApp(config);

    this.db = firebase.firestore();
    const settings = {
      timestampsInSnapshots: true
    };
    this.db.settings(settings);
  }

  public init(params: InitFirestoreParams) {
    if (this.initialized) {
      throw new Error("Firestore store already initialized!");
    }
    this.initialized = true;

    const interactiveName =
      params.type === "demo" ? "Demo Interactive" : (
      params.type === "test" ? "Test Interactive" :
      params.interactiveName
    );
    this.classData = {
      currentUserIsShared: false,
      interactiveName,
      clickToPlayId: null,
      students: []
    };

    switch (params.type) {
      case "demo":
        const studentDemoData = this.createDemoData();
        this.listenForChanges(studentDemoData);
        break;

      case "test":
        // TODO: figure out how to handle tests - use fake firestore? - for now just notify with no students
        this.notifyListeners();
        break;

      case "lara":
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
        this.classData.clickToPlayId = params.clickToPlayId;
        this.listenForChanges(pluginData);
        break;
    }
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

  private ensureInitalized() {
    if (!this.initialized) {
      throw new Error("Firestore store not initialized!");
    }
  }

  private listenForChanges(collection: firebase.firestore.CollectionReference) {
    const classData = this.classData;
    if (!classData) {
      throw new Error("classData not defined before listenForChanges called");
    }

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
          });
        }
      });

      // sort by display name
      classData.students.sort((a, b) => a.displayName < b.displayName ? -1 : (a.displayName > b.displayName ? 1 : 0));

      this.notifyListeners();
    });
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      listener(this.classData);
    });
  }

  private createDemoData() {
    const studentDemoData = this.db.collection("studentDemoData");

    // delete the current user's demo data
    let userId = "1@demo";
    this.userMap[userId] = "Ashley A.";
    this.currentUser = {
      userId,
      displayName: "Ashley A.",
      docRef: studentDemoData.doc(userId),
    };
    this.unshare();

    // create demo data for all fake students except for the current user
    for (let i = 2; i <= 26; i++) {
      userId = `${i}@demo`;
      const sharedStudentData: SharedStudentFirestoreData = {
        userId,
        iframeUrl: "https://sagemodeler.concord.org/branch/master/?launchFromLara=eyJyZWNvcmRpZCI6ODMwMTYsImFjY2Vzc0tleXMiOnsicmVhZE9ubHkiOiI5YTQzMjdhYmE0NGZlOTJlYzhiMDkxNWM0MjA1OWYwZGY1MThmMTdmIn19"
      };
      studentDemoData.doc(userId).set(sharedStudentData);
      this.userMap[userId] = `Student ${String.fromCharCode(63 + i)}`;
    }

    return studentDemoData;
  }
}

export const store = new FirestoreStore();
