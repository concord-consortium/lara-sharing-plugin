import * as React from "react";
import * as css from "./sharing-wrapper.sass";
import { IAuthoredState } from "../types";
import ButtonShare from "./icons/button-share.svg";
import ButtonUnShare from "./icons/button-unshare.svg";
import ViewClass from "./icons/view-class.svg";

export interface ISharingWrapperProps {
  authoredState: IAuthoredState;
  wrappedEmbeddableDiv?: HTMLDivElement;
}

interface IState {
  isShared: boolean;
  canViewClass: boolean;
}

export class SharingWrapper extends React.Component<ISharingWrapperProps, IState> {
  public state: IState = {
    isShared: false,
    canViewClass: false
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
    const { authoredState } = this.props;
    const { textContent } = authoredState;
    const { isShared, canViewClass} = this.state;

    const wrapperClass = css.wrapper;
    const wrappedContentClass = css.wrappedContent;
    const shareIcon = isShared
      ? <ButtonShare className={css.icon} onClick={this.toggleShared}/>
      : <ButtonUnShare className={css.icon} onClick={this.toggleShared}/>;
    const viewIconClass = canViewClass
      ? css.icon
      : `${css.icon} ${css.disabled}`;
    return (
      <div className={wrapperClass}>
        <div ref={this.wrappedEmbeddableDivContainer} />
        <div className={wrappedContentClass}>
          {/* {textContent} */}
          {shareIcon}
          <ViewClass className={viewIconClass} onClick={this.toggleCanView}/>
        </div>
      </div>
    );
  }
  private toggleShared = () => this.setState({isShared: !this.state.isShared});
  private toggleCanView = () => this.setState({canViewClass: !this.state.canViewClass});
}
export default SharingWrapper;
