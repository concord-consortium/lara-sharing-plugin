import firebase from 'firebase/app';
import "firebase/firestore";
import "firebase/auth";
import "firebase/database";
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
  iframeUrl: string | null;     // if null, model was previous shared but now is not
  comments: Comment[];          // comments from this user to other users
  lastCommentsSeen?: Record<string, number>;    // per-user map of timestamp last message this user has seen
}

export interface SharedStudentData extends SharedStudentFirestoreData {
  displayName: string;
  isCurrentUser: boolean;
  commentsReceived: CommentReceived[];
  lastCommentSeen: number;    // timestamp of when current user last read this user's messages
}

export interface Comment {
  recipient: string;      // userId
  message: string;
  time: number;           // unix timestamp
}

export interface CommentReceived extends Comment {
  sender: string;
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
  setAnswerSharedWithClass: (enabled: boolean) => Promise<Response>;
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
  public setAnswerSharedWithClass: (enabled: boolean) => Promise<Response>;
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
      this.classData = {
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
          this.setAnswerSharedWithClass = params.setAnswerSharedWithClass;

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

  public async toggleShare(iframeUrl: string) {
    this.ensureInitalized();
    if (this.classData) {
      if (this.classData.currentUserIsShared) {
        await this.unshare();
        return false;
      }
      else {
        await this.share(iframeUrl);
        return true;
      }
    }
    return false;
  }

  public async share(iframeUrl: string) {
    this.ensureInitalized();
    const response = await this.setAnswerSharedWithClass(true);
    if (response.status !== 200) {
      throw new Error("Answer sharing has failed");
    }
    if (this.currentUser) {
      const { userId } = this.currentUser;

      return this.db.runTransaction((transaction) => {
        // if the model has been shared once before, we just want to update the iframeUrl
        return transaction.get(this.currentUser!.docRef).then((doc) => {
          if (doc.exists) {
            transaction.update(this.currentUser!.docRef, {iframeUrl});
          } else {
            const student: SharedStudentFirestoreData = {
              version: 1,
              userId,
              iframeUrl,
              comments: [],
              lastCommentsSeen: {}
            };
            transaction.set(this.currentUser!.docRef, student);
          }
        });
      });
    }
  }

  public async unshare() {
    this.ensureInitalized();
    const response = await this.setAnswerSharedWithClass(false);
    if (response.status !== 200) {
      throw new Error("Answer unsharing has failed");
    }
    if (this.currentUser) {
      return this.db.runTransaction((transaction) => {
        // if the model has been shared, unsharing simply means wiping the iframeUrl.
        // comments from the user and to the user are preserved
        return transaction.get(this.currentUser!.docRef).then((doc) => {
          if (doc.exists) {
            transaction.update(this.currentUser!.docRef, {iframeUrl: null});
          }
        });
      });
    }
  }

  public markCommentsRead(userId: string) {
    this.ensureInitalized();
    if (this.currentUser) {
      this.currentUser.docRef.update(
        // must use FieldPath as userId may have periods in it
        new firebase.firestore.FieldPath("lastCommentsSeen", userId),
        firebase.firestore.Timestamp.now().toMillis()
      );
    }
  }

  public listenForInteractiveAvailable(listener: InteractiveAvailableListener) {
    this.interactiveAvailableListeners.push(listener);
  }

  public postComment(recipientUserId: string, message: string) {
    const comment: Comment = {
      recipient: recipientUserId,
      message,
      time: firebase.firestore.Timestamp.now().toMillis()
    }
    this.ensureInitalized();
    if (this.currentUser) {
      this.currentUser.docRef.update({
        comments: firebase.firestore.FieldValue.arrayUnion(comment)
      });
    }
  }

  public deleteComment(commentReceived: CommentReceived) {
    const comment: Comment = {
      recipient: commentReceived.recipient,
      message: commentReceived.message,
      time: commentReceived.time
    }
    this.ensureInitalized();
    if (this.currentUser) {
      this.currentUser.docRef.update({
        comments: firebase.firestore.FieldValue.arrayRemove(comment)
      });
    }
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
        let lastCommentsSeen: Record<string, number> = {};
        snapshot.forEach((doc) => {
          const studentData = doc.data() as SharedStudentFirestoreData;
          const { userId, iframeUrl, comments } = studentData;
          if (userId === currentUserId) {
            if (iframeUrl) {
              classData.currentUserIsShared = true;
            }
            if (studentData.lastCommentsSeen) {
              lastCommentsSeen = studentData.lastCommentsSeen;
            }
          }

          const displayName = this.userMap[userId];
          if (displayName) {
            classData.students.push({
              userId,
              displayName,
              iframeUrl,
              comments,
              commentsReceived: [],
              lastCommentSeen: -1,
              isCurrentUser: userId === currentUserId,
            });
          }
        });

        // collect all comments by recipient.
        // (In database, comments are stored under senders key, to give edit ownership to them, but
        // for comment lists we want to sort by recipient.)
        classData.students.forEach(student => {
          student.comments?.forEach(comment => {
            const recipient = classData.students.find(s => s.userId === comment.recipient)
            if (recipient) {
              recipient.commentsReceived.push({
                sender: student.userId,
                ...comment
              })
            }
          })
        });
        // then sort
        classData.students.forEach(student => {
          student.commentsReceived.sort((a, b) => a.time - b.time);
        });

        // find timestamps of last comment seen
        Object.keys(lastCommentsSeen).forEach(userId => {
          const studentData = classData.students.find(s => s.userId === userId);
          if (studentData) {
            studentData.lastCommentSeen = lastCommentsSeen[userId];
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

    let sharedStudentData: SharedStudentFirestoreData = {
      userId,
      iframeUrl: null,
      comments: [],
      lastCommentsSeen: {
        "4@demo": 25,
      }
    };
    studentDemoData.doc(userId).set(sharedStudentData);

    const iframeUrl = "https://sagemodeler.concord.org/branch/master/?launchFromLara=eyJyZWNvcmRpZCI6ODMwMTYsImFjY2Vzc0tleXMiOnsicmVhZE9ubHkiOiI5YTQzMjdhYmE0NGZlOTJlYzhiMDkxNWM0MjA1OWYwZGY1MThmMTdmIn19";

    userId = "2@demo";
    sharedStudentData = {
      userId,
      iframeUrl,
      comments: [
        {
          recipient: "1@demo",
          message: "Hi Tameka I like your model!",
          time: 10,
        },
        {
          recipient: "4@demo",
          message: "Hey student D, this model is terrible",
          time: 20,
        }
      ],
    };
    studentDemoData.doc(userId).set(sharedStudentData);
    this.userMap[userId] = "Longlonglastname, Marie-Marie-Marie";

    userId = "3@demo";
    sharedStudentData = {
      userId,
      iframeUrl,
      comments: [
        {
          recipient: "1@demo",
          message: "I don't understand this model at all, Tameka.",
          time: 0,
        },
        {
          recipient: "2@demo",
          message: "Hi Marie-Marie-Marie",
          time: 5,
        },
        {
          recipient: "3@demo",
          message: "This is my model and I like it",
          time: 5,
        },
        {
          recipient: "4@demo",
          message: "I really like this model Student D",
          time: 10,
        },
        {
          recipient: "4@demo",
          message: "It's awesome",
          time: 11,
        },
        {
          recipient: "4@demo",
          message: "Oh wait, actually I agree with Marie.",
          time: 30,
        },
        {
          recipient: "4@demo",
          message: `Thinking this over more, I let myself be swayed by peer-pressure.
          Also I want this comment to appear below the fold.`,
          time: 30,
        }
      ],
    };
    studentDemoData.doc(userId).set(sharedStudentData);
    this.userMap[userId] = "Byrd, Pharren";

    // create demo data for all fake students except for the current user
    for (let i = 4; i <= 26; i++) {
      userId = `${i}@demo`;
      sharedStudentData = {
        userId,
        iframeUrl,
        comments: []
      };
      studentDemoData.doc(userId).set(sharedStudentData);
      this.userMap[userId] = `Student ${String.fromCharCode(64 + i)}`;
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
