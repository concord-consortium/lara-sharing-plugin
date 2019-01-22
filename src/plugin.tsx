import * as React from "react";
import * as ReactDOM from "react-dom";
import PluginApp from "./components/plugin-app";
import PluginConfig from "./config/plugin-config";
import { IAuthoredState } from "./types";
import {IExternalScriptContext, ILara} from "./lara/interfaces";
import { store } from "./stores/firestore";
import {
  getFirebaseJWT,
  getClassInfo,
  getInteractiveState,
  getFireStoreParams
} from "./lara/helper-functions";

const DefaultFirebaseApp = "test-app";

// TODO: figure out store.init()
// store.init({type: "lara"});

let PluginAPI: ILara;

const getAuthoredState = (context: IExternalScriptContext) => {
  if (!context.authoredState) {
    return {};
  }
  let authoredState;
  try {
    authoredState = JSON.parse(context.authoredState);
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.warn("Unexpected authoredState:", context.authoredState);
    return {};
  }
  return authoredState;
};

export class TeacherEditionTipsPlugin {
  public context: IExternalScriptContext;
  public authoredState: IAuthoredState;
  public pluginAppComponent: any;

  constructor(context: IExternalScriptContext) {
    this.context = context;
    this.authoredState = getAuthoredState(context);
    // TODO: add store.init() after getting all data from lara
    Promise.all([
      getFirebaseJWT(context, this.authoredState.firebaseAppName || DefaultFirebaseApp),
      getClassInfo(context),
      getInteractiveState(context)
    ])
    .then( ([jwtResponse, classInfo, interactiveState]) => {
      const config = getFireStoreParams(context, jwtResponse, classInfo, interactiveState);
      console.log(config);
      store.init(config);
      this.renderPluginApp();
    });
  }

  public renderPluginApp = () => {
    PluginAPI = (window as any).LARA;
    const authoredState = getAuthoredState(this.context);
    this.pluginAppComponent = ReactDOM.render(
      <PluginApp
        authoredState={authoredState}
        wrappedEmbeddableDiv={this.context.wrappedEmbeddableDiv}
        PluginAPI={PluginAPI}
        store={store}
      />,
      this.context.div);
  }
}

export const initPlugin = () => {
  PluginAPI = (window as any).LARA;
  const {PluginID, PluginName} = PluginConfig;
  if (!PluginAPI || !PluginAPI.registerPlugin) {
    // tslint:disable-next-line:no-console
    console.warn(`LARA Plugin API not available, ${PluginName} terminating`);
    return;
  }
  // tslint:disable-next-line:no-console
  console.log(`LARA Plugin API available, ${PluginName} initialization`);
  PluginAPI.registerPlugin(PluginID, TeacherEditionTipsPlugin);
};

initPlugin();
