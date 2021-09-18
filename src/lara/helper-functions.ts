import {
  SharedClassUserMap,
  InitLaraFirestoreParams
} from "../stores/firestore";
import * as PluginAPI from "@concord-consortium/lara-plugin-api";

export const portalUserPathToFirebaseId = (portalUserPath: string) => {
  const portalPathSeperator = "/";
  const firebaseReplacement = "-";
  const replaceRegx = new RegExp(portalPathSeperator, "g");
  return portalUserPath.replace(replaceRegx, firebaseReplacement);
};

const getDisplayName = (student: PluginAPI.IUser): string => {
  const {first_name, last_name} = student;
  const first = (first_name && first_name.length > 0)
     ? first_name.charAt(0).toUpperCase() + first_name.slice(1)
     : "";
  const last = (last_name && last_name.length > 0)
     ? last_name.charAt(0).toUpperCase() + last_name.slice(1)
     : "";
  return `${last}, ${first}`;
};

export const getFireStoreParams = (
  context: PluginAPI.IPluginRuntimeContext,
  jwt: PluginAPI.IJwtResponse,
  classInfo: PluginAPI.IClassInfo
): InitLaraFirestoreParams => {
    const claims = (jwt.claims as PluginAPI.IJwtClaims);
    const rawFirebaseJWT = jwt.token;
    const portalDomain = claims.domain;
    const portalClaims = claims.claims;
    const offeringId = `${portalClaims.offering_id}`;
    const pluginId = context.pluginId.toString();
    const portalUserId = portalUserPathToFirebaseId(portalClaims.user_id);
    const userMap: SharedClassUserMap = {};
    const interactiveName = context.wrappedEmbeddable?.laraJson.name;
    const classHash = classInfo.class_hash;
    const interactiveAvailable = context.wrappedEmbeddable ? context.wrappedEmbeddable.interactiveAvailable : true;
    // tslint:disable-next-line:no-empty
    const onInteractiveAvailableFillIn = (handler: PluginAPI.IInteractiveAvailableEventHandler) => {};
    const onInteractiveAvailable = context.wrappedEmbeddable ? context.wrappedEmbeddable.onInteractiveAvailable : onInteractiveAvailableFillIn;
    const getReportingUrl = context.wrappedEmbeddable ? context.wrappedEmbeddable.getReportingUrl : () => new Promise<null>(resolve => resolve(null));
    const setAnswerSharedWithClass = context.wrappedEmbeddable?.setAnswerSharedWithClass || (() => Promise.reject("Sharing not supported"));
    // ADD
    classInfo.students.forEach( (student) => {
      const key = portalUserPathToFirebaseId(student.id);
      const value = getDisplayName(student);
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
      onInteractiveAvailable,
      interactiveAvailable,
      getReportingUrl,
      setAnswerSharedWithClass
    };
    return params;
};
