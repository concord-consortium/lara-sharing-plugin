import * as React from "react";
import * as ReactDOM from "react-dom";
import SharingWrapper from "./sharing-wrapper";
import { IAuthoredState } from "../types";

interface IProps {
  PluginAPI: any;
  authoredState: IAuthoredState;
  wrappedEmbeddableDiv?: HTMLDivElement;
  wrappedEmbeddableContext?: object;
}

interface IState {}

export default class PluginApp extends React.Component<IProps, IState> {

  public render() {
    const {authoredState, wrappedEmbeddableDiv} = this.props;
    return(
      <div className="plugin-wrapper">
        <SharingWrapper
          authoredState={authoredState}
          wrappedEmbeddableDiv={wrappedEmbeddableDiv} />
      </div>
    );
  }

}
