import * as React from "react";
import * as ReactDOM from "react-dom";
import SharingWrapper from "./sharing-wrapper";
import { IAuthoredState } from "../types";
import { FirestoreStore } from "../stores/firestore";

interface IProps {
  PluginAPI: any;
  authoredState: IAuthoredState;
  wrappedEmbeddableDiv?: HTMLDivElement;
  wrappedEmbeddableContext?: object;
  store: FirestoreStore;
}

interface IState {}

export default class PluginApp extends React.Component<IProps, IState> {

  public render() {
    const {authoredState, wrappedEmbeddableDiv, store} = this.props;
    return(
      <div className="plugin-wrapper">
        <SharingWrapper
          authoredState={authoredState}
          wrappedEmbeddableDiv={wrappedEmbeddableDiv}
          store={store} />
      </div>
    );
  }

}
