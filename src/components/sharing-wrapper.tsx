import * as React from "react";
import * as css from "./sharing-wrapper.sass";
import { IAuthoredState } from "../types";

export interface ISharingWrapperProps {
  authoredState: IAuthoredState;
  wrappedEmbeddableDiv?: HTMLDivElement;
}

interface IState {}

export class SharingWrapper extends React.Component<ISharingWrapperProps, IState> {
  public state: IState = {};

  private wrappedEmbeddableDivContainer = React.createRef<HTMLDivElement>();

  public componentDidMount() {
    const { wrappedEmbeddableDiv } = this.props;
    if (!wrappedEmbeddableDiv) {
      return;
    }
    const containerNode = this.wrappedEmbeddableDivContainer.current!;
    containerNode.appendChild(wrappedEmbeddableDiv);
    // if (containerNode) {
    //   containerNode.appendChild(wrappedEmbeddableDiv);
    // }
  }

  public render() {
    const { authoredState } = this.props;
    const { textContent } = authoredState;

    const wrapperClass = css.wrapper;
    const wrappedContentClass = css.wrappedContent;

    return (
      <div className={wrapperClass}>
        <div ref={this.wrappedEmbeddableDivContainer} />
        <div className={wrappedContentClass}>
          {textContent}
        </div>
      </div>
    );
  }

}
export default SharingWrapper;
