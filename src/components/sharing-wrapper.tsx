import * as React from "react";
import * as css from "./sharing-wrapper.sass";
import { IAuthoredState } from "../types";
import ButtonShareIcon from "./icons/button-share.svg";
import ButtonUnShareIcon from "./icons/button-unshare.svg";
import ViewClassIcon from "./icons/view-class.svg";
import ViewClass from "./view-class";
import { SharedClassData, FirestoreStore, FirestoreStoreCancelListener } from "../stores/firestore";

export interface ISharingWrapperProps {
  authoredState: IAuthoredState;
  wrappedEmbeddableDiv?: HTMLDivElement;
  store: FirestoreStore;
}

interface IState {
  showViewClass: boolean;
  sharedClassData: SharedClassData | null;
}

export class SharingWrapper extends React.Component<ISharingWrapperProps, IState> {
  public state: IState = {
    showViewClass: false,
    sharedClassData: null
  };

  private cancelListener: FirestoreStoreCancelListener;
  private wrappedEmbeddableDivContainer = React.createRef<HTMLDivElement>();

  public componentWillMount() {
    this.cancelListener = this.props.store.listen((classData) => {
      this.setState({sharedClassData: classData});
    });
  }

  public componentWillUnmount() {
    this.cancelListener();
  }

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
    const { store } = this.props;
    const { showViewClass, sharedClassData} = this.state;

    const wrapperClass = css.wrapper;
    return (
      <div className={wrapperClass}>
        <div ref={this.wrappedEmbeddableDivContainer} />
        {this.renderIcons()}
        {showViewClass ? <ViewClass onClose={this.handleCloseViewClass} store={store} sharedClassData={sharedClassData} /> : null}
      </div>
    );
  }

  private renderIcons() {
    const { sharedClassData } = this.state;

    if (sharedClassData) {
      const { currentUserIsShared: isShared } = sharedClassData;
      const wrappedContentClass = css.wrappedContent;
      const shareIcon = isShared
        ? <ButtonShareIcon className={css.icon} onClick={this.toggleShared}/>
        : <ButtonUnShareIcon className={css.icon} onClick={this.toggleShared}/>;
      const viewIconClass = isShared
        ? css.icon
        : `${css.icon} ${css.disabled}`;
      const viewIcon = <ViewClassIcon className={viewIconClass} onClick={this.toggleShowView}/>;

      return (
        <div className={wrappedContentClass}>
          {shareIcon}
          {viewIcon}
        </div>
      );
    }
  }

  private toggleShared = () => {
    // TODO: get iframeUrl from Lara
    const iframeUrl = "https://sagemodeler.concord.org/branch/master/?launchFromLara=eyJyZWNvcmRpZCI6ODMwMTYsImFjY2Vzc0tleXMiOnsicmVhZE9ubHkiOiI5YTQzMjdhYmE0NGZlOTJlYzhiMDkxNWM0MjA1OWYwZGY1MThmMTdmIn19";
    this.props.store.toggleShare(iframeUrl);
  }

  private toggleShowView = () => {
    const { sharedClassData: classData } = this.state;
    if (classData && classData.currentUserIsShared) {
      this.setState({showViewClass: !this.state.showViewClass});
    }
  }

  private handleCloseViewClass = () => this.setState({showViewClass: false});
}
export default SharingWrapper;
