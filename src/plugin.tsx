import * as React from "react";
import * as ReactDOM from "react-dom";
import PluginApp from "./components/plugin-app";
import PluginConfig from "./config/plugin-config";
import { DefaultFirebaseAppName } from "./config/plugin-config";
import { IAuthoredState } from "./types";
import { store } from "./stores/firestore";
import {
  getFireStoreParams
} from "./lara/helper-functions";
import * as PluginAPI from "@concord-consortium/lara-plugin-api";

const getAuthoredState = (context: PluginAPI.IPluginRuntimeContext) => {
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

export class LaraSharingPlugin {
  public context: PluginAPI.IPluginRuntimeContext;
  public authoredState: IAuthoredState;
  public pluginAppComponent: any;

  constructor(context: PluginAPI.IPluginRuntimeContext) {
    const errMsg = "Plugin context is incorrect, the plugin instance has been configured incorrectly.";
    if (!context.wrappedEmbeddable) {
      // tslint:disable-next-line:no-console
      console.error(errMsg);
      return;
    }

    this.context = context;
    this.authoredState = getAuthoredState(context);

    const firebasePromise = context.getFirebaseJwt(this.authoredState.firebaseAppName || DefaultFirebaseAppName);
    const classInfoPromise = context.getClassInfo();
    const interactiveStatePromise = context.wrappedEmbeddable.getInteractiveState();
    if (firebasePromise && classInfoPromise && interactiveStatePromise) {
      Promise.all([ firebasePromise, classInfoPromise, interactiveStatePromise])
      .then( ([jwtResponse, classInfo, interactiveState]) => {
        const config = getFireStoreParams(context, jwtResponse, classInfo, interactiveState);
        // tslint:disable-next-line:no-console
        console.log(config);
        store.init(config)
          .then(() => this.renderPluginApp())
          .catch((err) => alert(err.toString()));
      });
    } else {
      // tslint:disable-next-line:no-console
      console.error(errMsg);
    }
  }

  public renderPluginApp = () => {
    const authoredState = getAuthoredState(this.context);
    this.pluginAppComponent = ReactDOM.render(
      <PluginApp
        getReportingUrl={this.context.wrappedEmbeddable!.getReportingUrl}
        authoredState={authoredState}
        wrappedEmbeddableDiv={this.context.wrappedEmbeddable && this.context.wrappedEmbeddable.container}
        store={store}
      />,
      this.context.container);
  }
}

export const initPlugin = () => {
  const {PluginID, PluginName} = PluginConfig;
  if (!PluginAPI || !PluginAPI.registerPlugin) {
    // tslint:disable-next-line:no-console
    console.warn(`LARA Plugin API not available, ${PluginName} terminating`);
    return;
  }
  // tslint:disable-next-line:no-console
  console.log(`LARA Plugin API available, ${PluginName} initialization`);
  PluginAPI.registerPlugin(PluginID, LaraSharingPlugin);
};

initPlugin();
