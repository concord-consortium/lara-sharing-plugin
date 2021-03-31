import * as React from "react";

import * as css from "./interactive-and-wrapper.sass";
import { ISharingWrapperProps, SharingWrapper } from "../sharing-wrapper";
import { IAuthoredState } from "../../types";
import { FirestoreStore } from "../../stores/firestore";

interface IProps {
  authoredState: IAuthoredState;
  updateFunction?: (nextState: ISharingWrapperProps) => void;
  store: FirestoreStore | null;
}

interface IState {}

// Headless container that provides state to children.
export default class InteractiveAndWrapper extends React.Component<IProps, IState> {
  private domRef: any;

  public componentWillMount(){
    const url = "http://concord-consortium.github.io/lara-interactive-api/iframe.html";
    this.domRef = document.createElement("div");
    this.domRef.setAttribute("id", "wrapped-div");
    this.domRef.setAttribute("class", css.embeddableDiv);
    this.domRef.innerHTML = `<div class="${css.questionHdr}">Question #1</div><iframe src="${url}"/>`;
  }

  public render() {
    const {authoredState} = this.props;
    return (
      <SharingWrapper
        authoredState={authoredState}
        wrappedEmbeddableDiv={this.domRef}
        store={this.props.store}
      />
    );
  }

}
