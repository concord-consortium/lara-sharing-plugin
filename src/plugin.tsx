import * as React from "react";
import * as ReactDOM from "react-dom";
import PluginApp from "./components/plugin-app";
import PluginConfig from "./config/plugin-config";
import { DefaultFirebaseAppName } from "./config/plugin-config";
import { IAuthoredState } from "./types";
import { FirestoreStore } from "./stores/firestore";
import {
  getFireStoreParams
} from "./lara/helper-functions";
import * as PluginAPI from "@concord-consortium/lara-plugin-api";
import InlineAuthoringForm from "./components/authoring/inline-authoring-form";

type IPluginContext = PluginAPI.IPluginRuntimeContext | PluginAPI.IPluginAuthoringContext;
const getAuthoredState = (context: IPluginContext): IAuthoredState => {
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
  public store: FirestoreStore;

  constructor(context: PluginAPI.IPluginRuntimeContext) {
    const errMsg = "Plugin context is incorrect, the plugin instance has been configured incorrectly.";
    if (!context.wrappedEmbeddable) {
      // tslint:disable-next-line:no-console
      console.error(errMsg);
      return;
    }

    this.context = context;
    this.authoredState = getAuthoredState(context);
    this.store = new FirestoreStore();

    // Initial render, done as fast as possible, to re-add embedded interactive iframe before LARA starts
    // communication with it. Workaround for: https://www.pivotaltracker.com/story/show/177568401
    ReactDOM.render(
      <PluginApp
        authoredState={this.authoredState}
        wrappedEmbeddableDiv={this.context.wrappedEmbeddable && this.context.wrappedEmbeddable.container}
        store={null}
      />,
      this.context.container);

    const firebasePromise = context.getFirebaseJwt(this.authoredState.firebaseAppName || DefaultFirebaseAppName);
    const classInfoPromise = context.getClassInfo();
    if (firebasePromise && classInfoPromise) {
      Promise.all([ firebasePromise, classInfoPromise])
      .then( ([jwtResponse, classInfo]) => {
        const config = getFireStoreParams(context, jwtResponse, classInfo);
        // tslint:disable-next-line:no-console
        this.store.init(config)
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
        authoredState={authoredState}
        wrappedEmbeddableDiv={this.context.wrappedEmbeddable && this.context.wrappedEmbeddable.container}
        store={this.store}
      />,
      this.context.container);
  }
}

export class LaraSharingAuthoringPlugin {
  public context: PluginAPI.IPluginAuthoringContext;
  public authoredState: IAuthoredState;
  public pluginAppComponent: any;

  constructor(context: PluginAPI.IPluginAuthoringContext) {
    this.context = context;
    this.renderPluginApp();
  }

  public renderPluginApp = () => {
    const authoredState = getAuthoredState(this.context);
    const { saveAuthoredPluginState } = this.context;
    this.pluginAppComponent = ReactDOM.render(
      <InlineAuthoringForm
        initialAuthoredState={authoredState}
        saveAuthoredPluginState={saveAuthoredPluginState}
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
  PluginAPI.registerPlugin({
    runtimeClass: LaraSharingPlugin,
    authoringClass: LaraSharingAuthoringPlugin
  });
};

initPlugin();
