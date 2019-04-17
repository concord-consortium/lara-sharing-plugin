import * as React from "react";
import SharingWrapper from "./sharing-wrapper";
import { IAuthoredState } from "../types";
import { FirestoreStore } from "../stores/firestore";

interface IProps {
  getReportingUrl: () => Promise<string | null> | null;
  authoredState: IAuthoredState;
  wrappedEmbeddableDiv: HTMLElement | null;
  wrappedEmbeddableContext?: object;
  store: FirestoreStore;
}

interface IState {}

export default class PluginApp extends React.Component<IProps, IState> {

  public render() {
    const {authoredState, wrappedEmbeddableDiv, getReportingUrl, store} = this.props;
    return(
      <div className="plugin-wrapper">
        <SharingWrapper
          getReportingUrl={getReportingUrl}
          authoredState={authoredState}
          wrappedEmbeddableDiv={wrappedEmbeddableDiv}
          store={store} />
      </div>
    );
  }

}
