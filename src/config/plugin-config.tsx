
export interface IPluginConfig {
  PluginName: string;
  PluginID: string;
}

const PluginConfig: IPluginConfig = {
  PluginName: "LARA Sharing Plugin",
  PluginID: "LaraSharingPlugin"
};

// The Portal should define a FirebaseApp model with a `name` of "lara-sharing"
// Also this model must have the appropriate `private_key` for the DB.
export const DefaultFirebaseAppName = "lara-sharing";

export const FirebaseConfig = {
  apiKey: atob("QUl6YVN5Q0dRRW1iV3I0eVA3WkJ3LVpqbWtmUlUxbEpOZ0tMaWtZ"),
  authDomain: "share-plugin-dev.firebaseapp.com",
  databaseURL: "https://share-plugin-dev.firebaseio.com",
  projectId: "share-plugin-dev",
  storageBucket: "share-plugin-dev.appspot.com",
  messagingSenderId: "449409198581"
};

export default PluginConfig;
