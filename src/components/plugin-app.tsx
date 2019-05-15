import * as React from "react";
import SharingWrapper from "./sharing-wrapper";
import { IAuthoredState } from "../types";
import { FirestoreStore } from "../stores/firestore";

interface IProps {
  authoredState: IAuthoredState;
  wrappedEmbeddableDiv: HTMLElement | null;
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
