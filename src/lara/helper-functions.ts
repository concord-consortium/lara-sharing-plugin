import {
  IExternalScriptContext,
  IJwtResponse,
  IJwtClaims,
  IClassInfo,
  IInteractiveState
} from "./interfaces";
import {
  SharedClassUserMap,
  InitLaraFirestoreParams
} from "../stores/firestore";

export const getFirebaseJWT = (context: IExternalScriptContext, appname: string): Promise<IJwtResponse> => {
  const {getFirebaseJwtUrl, authoredState} = context;
  return new Promise( (resolve, reject) => {
    const appSpecificUrl = getFirebaseJwtUrl(appname);
    fetch(appSpecificUrl, {method: "POST"})
    .then( (response) => {
      response.json()
      .then( (data) => {
        try {
          const token = data.token.split(".")[1];
          const claimsJson = atob(token);
          const claims = JSON.parse(claimsJson);
          resolve({token: data, claims});
        } catch (error) {
          console.error("unable to parse JWT Token");
          console.error(error);
        }
        resolve({token: data, claims: {}});
      });
    });
  });
};

export const getClassInfo = (context: IExternalScriptContext): Promise<IClassInfo> => {
  const {classInfoUrl} = context;
  return new Promise( (resolve, reject) => {
    fetch(classInfoUrl, {method: "get", credentials: "include"})
    .then( (resp) => resp.json().then( (data) => resolve(data)));
  });
};

export const getInteractiveState = (context: IExternalScriptContext): Promise<IInteractiveState> => {
  const {interactiveStateUrl} = context;
  return new Promise( (resolve, reject) => {
    fetch(interactiveStateUrl, {method: "get", credentials: "include"})
    .then( (resp) => resp.json().then( (data) => resolve(data)));
  });
};

export const portalUserPathToFirebaseId = (portalUserPath: string) => {
  const portalPathSeperator = "/";
  const firebaseReplacement = "-";
  const replaceRegx = new RegExp(portalPathSeperator, "g");
  return portalUserPath.replace(replaceRegx, firebaseReplacement);
};

export const getFireStoreParams = (
  context: IExternalScriptContext,
  jwt: IJwtResponse,
  classInfo: IClassInfo,
  interactiveState: IInteractiveState): InitLaraFirestoreParams => {
    const claims = (jwt.claims as IJwtClaims);
    const rawFirebaseJWT = jwt.token;
    const portalDomain = claims.domain;
    const portalClaims = claims.claims;
    const offeringId = `${portalClaims.offering_id}`;
    const pluginId = context.pluginId;
    const portalUserId = portalUserPathToFirebaseId(portalClaims.user_id);
    const userMap: SharedClassUserMap = {};
    const interactiveName = interactiveState.interactive_name;
    const classHash = classInfo.class_hash;
    // TODO: I don't think we need to initialize this from here....
    // This would erase all share info
    // classInfo.students.forEach( (student) => {
    //   const key = portalUserPathToFirebaseId(student.id);
    //   userMap[key] = undefined;
    // });
    return {
      rawFirebaseJWT,
      portalDomain,
      offeringId,
      pluginId,
      portalUserId,
      userMap,
      interactiveName,
      classHash,
      type: "lara"
    };
};
