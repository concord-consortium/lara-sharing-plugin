import * as React from "react";
import * as css from "./sharing-wrapper.sass";
import { IAuthoredState } from "../types";
import ButtonShareIcon from "./icons/button-share.svg";
import ButtonUnShareIcon from "./icons/button-unshare.svg";
import ViewClassIcon from "./icons/view-class.svg";
import ViewClass from "./view-class";
import ShareModal from "./share-modal";
import { SharedClassData, FirestoreStore, FirestoreStoreCancelListener } from "../stores/firestore";

export interface ISharingWrapperProps {
  authoredState: IAuthoredState;
  wrappedEmbeddableDiv?: HTMLDivElement;
  store: FirestoreStore;
}

interface IState {
  showViewClass: boolean;
  showShareModal: boolean;
  dontShowShareModal: boolean;
  sharedClassData: SharedClassData | null;
  clickToPlayShowing: boolean;
}

export class SharingWrapper extends React.Component<ISharingWrapperProps, IState> {
  public state: IState = {
    showViewClass: false,
    showShareModal: false,
    dontShowShareModal: false,
    sharedClassData: null,
    clickToPlayShowing: false
  };

  private cancelListener: FirestoreStoreCancelListener;
  private wrappedEmbeddableDivContainer = React.createRef<HTMLDivElement>();
  private monitorClickToPlayInterval: number | null;

  public componentWillMount() {
    this.cancelListener = this.props.store.listen((sharedClassData) => {
      if (sharedClassData && sharedClassData.clickToPlayId && !this.monitorClickToPlayInterval) {
        const { clickToPlayId } = sharedClassData;
        const clickToPlayShowing = this.clickToPlayShowing(clickToPlayId);
        this.setState({sharedClassData, clickToPlayShowing}, () => {
          this.monitorClickToPlayInterval = this.monitorClickToPlay(clickToPlayId);
        });
      }
      else {
        this.setState({sharedClassData});
      }
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
    const { showShareModal, showViewClass, sharedClassData} = this.state;

    const wrapperClass = css.wrapper;
    return (
      <div className={wrapperClass}>
        <div ref={this.wrappedEmbeddableDivContainer} />
        {this.renderIcons()}
        {showShareModal ? <ShareModal onClose={this.handleCloseShowModal} sharedClassData={sharedClassData} /> : null}
        {showViewClass ? <ViewClass onClose={this.handleCloseViewClass} store={store} sharedClassData={sharedClassData} /> : null}
      </div>
    );
  }

  private renderIcons() {
    const { sharedClassData, clickToPlayShowing } = this.state;

    if (sharedClassData && !clickToPlayShowing) {
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
    const iframeUrl = "https://sagemodeler.concord.org/branch/use-codap-470/?launchFromLara=eyJyZWNvcmRpZCI6ODMwMTYsImFjY2Vzc0tleXMiOnsicmVhZE9ubHkiOiI5YTQzMjdhYmE0NGZlOTJlYzhiMDkxNWM0MjA1OWYwZGY1MThmMTdmIn19";
    const shared = this.props.store.toggleShare(iframeUrl);
    if (shared && !this.state.dontShowShareModal) {
      this.setState({showShareModal: true});
    }
  }

  private toggleShowView = () => {
    const { sharedClassData: classData } = this.state;
    if (classData && classData.currentUserIsShared) {
      this.setState({showViewClass: !this.state.showViewClass});
    }
  }

  private handleCloseViewClass = () => this.setState({showViewClass: false});

  private handleCloseShowModal = (dontShowAgain: boolean) => {
    this.setState({showShareModal: false, dontShowShareModal: dontShowAgain});
  }

  private elementVisible(element: HTMLElement) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  }

  private clickToPlayShowing(clickToPlayId: string) {
    const element = document.getElementById(clickToPlayId);
    return element ? this.elementVisible(element) : false;
  }

  private monitorClickToPlay(clickToPlayId: string) {
    const element = document.getElementById(clickToPlayId);
    if (!element) {
      return null;
    }

    const checkIfClickToPlayIsVisible = () => {
      const {clickToPlayShowing} = this.state;
      const clickToPlayNowShowing = this.elementVisible(element);
      if (clickToPlayShowing !== clickToPlayNowShowing) {
        this.setState({clickToPlayShowing: clickToPlayNowShowing});
      }
    };
    checkIfClickToPlayIsVisible();

    return setInterval(checkIfClickToPlayIsVisible, 250);
  }
}
export default SharingWrapper;
