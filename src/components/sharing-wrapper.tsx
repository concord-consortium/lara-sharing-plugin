import * as React from "react";
import * as css from "./sharing-wrapper.sass";
import { IAuthoredState } from "../types";
import ButtonShareIcon from "./icons/button-share.svg";
import ButtonUnShareIcon from "./icons/button-unshare.svg";
import ViewClassIcon from "./icons/view-class.svg";
import ViewClass, { SharedClassData } from "./view-class";

export interface ISharingWrapperProps {
  authoredState: IAuthoredState;
  wrappedEmbeddableDiv?: HTMLDivElement;
  sharedClassData?: SharedClassData;
}

interface IState {
  isShared: boolean;
  showViewClass: boolean;
}

export class SharingWrapper extends React.Component<ISharingWrapperProps, IState> {
  public state: IState = {
    isShared: false,
    showViewClass: false,
  };

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
    const { authoredState, sharedClassData } = this.props;
    const { textContent } = authoredState;
    const { isShared, showViewClass} = this.state;

    const wrapperClass = css.wrapper;
    const wrappedContentClass = css.wrappedContent;
    const shareIcon = isShared
      ? <ButtonShareIcon className={css.icon} onClick={this.toggleShared}/>
      : <ButtonUnShareIcon className={css.icon} onClick={this.toggleShared}/>;
    const viewIconClass = isShared
      ? css.icon
      : `${css.icon} ${css.disabled}`;
    return (
      <div className={wrapperClass}>
        <div ref={this.wrappedEmbeddableDivContainer} />
        <div className={wrappedContentClass}>
          {/* {textContent} */}
          {shareIcon}
          <ViewClassIcon className={viewIconClass} onClick={this.toggleShowView}/>
        </div>
        {showViewClass ? <ViewClass onClose={this.handleCloseViewClass} sharedClassData={sharedClassData} /> : null}
      </div>
    );
  }
  private toggleShared = () => this.setState({isShared: !this.state.isShared});
  private toggleShowView = () => {
    if (this.state.isShared) {
      this.setState({showViewClass: !this.state.showViewClass});
    }
  }
  private handleCloseViewClass = () => this.setState({showViewClass: false});
}
export default SharingWrapper;
