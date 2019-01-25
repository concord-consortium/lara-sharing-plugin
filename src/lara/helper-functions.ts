import {
  IExternalScriptContext,
  IJwtResponse,
  IJwtClaims,
  IClassInfo,
  IInteractiveState,
  IUser
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
          // tslint:disable-next-line:no-console
          console.error("unable to parse JWT Token");
          // tslint:disable-next-line:no-console
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

export const getInteractiveState = (stringOrContext: string | IExternalScriptContext): Promise<IInteractiveState> => {
  const interactiveStateUrl = typeof stringOrContext === "string" ? stringOrContext : stringOrContext.interactiveStateUrl;
  return new Promise( (resolve, reject) => {
    fetch(interactiveStateUrl, {method: "get", credentials: "include"})
    .then( (resp) => resp.json().then( (data) => resolve(data)));
  });
};

export const getLaraReportingUrl = (interactiveRunState: IInteractiveState): string|undefined => {
  try {
    const rawJSON = JSON.parse(interactiveRunState.raw_data);
    if (rawJSON && rawJSON.lara_options && rawJSON.lara_options.reporting_url) {
      return rawJSON.lara_options.reporting_url;
    }
  }
  catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

export const portalUserPathToFirebaseId = (portalUserPath: string) => {
  const portalPathSeperator = "/";
  const firebaseReplacement = "-";
  const replaceRegx = new RegExp(portalPathSeperator, "g");
  return portalUserPath.replace(replaceRegx, firebaseReplacement);
};

const studentValue = (student: IUser): string => {
  const {first_name, last_name} = student;
  const first = (first_name && first_name.length > 0)
     ? first_name.charAt(0).toUpperCase() + first_name.slice(1)
     : "";
  const last = (last_name && last_name.length > 0)
     ? last_name.charAt(0).toUpperCase() + "."
     : "";
  return `${first} ${last}`;
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
    const clickToPlayId = context.experimental.clickToPlayId;
    const interactiveStateUrl = context.interactiveStateUrl;
    classInfo.students.forEach( (student) => {
      const key = portalUserPathToFirebaseId(student.id);
      const value = studentValue(student);
      userMap[key] = value;
    });
    const params: InitLaraFirestoreParams = {
      type: "lara",
      rawFirebaseJWT,
      portalDomain,
      offeringId,
      pluginId,
      portalUserId,
      userMap,
      interactiveName,
      classHash,
      clickToPlayId,
      interactiveStateUrl
    };
    return params;
};
