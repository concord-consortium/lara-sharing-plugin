import * as React from "react";
import * as css from "./sharing-wrapper.sass";
import { IAuthoredState } from "../types";
import ButtonShareIcon from "./icons/button-share.svg";
import ButtonUnShareIcon from "./icons/button-unshare.svg";
import ViewClassIcon from "./icons/view-class.svg";
import ViewClass from "./view-class";
import ShareModal from "./share-modal";
import ToggleButton from "./toggle-button";

import { SharedClassData, FirestoreStore, FirestoreStoreCancelListener } from "../stores/firestore";

export interface ISharingWrapperProps {
  getReportingUrl: () => Promise<string | null> | null;
  authoredState: IAuthoredState;
  wrappedEmbeddableDiv: HTMLElement | null;
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
    const { sharedClassData } = this.state;

    if (sharedClassData) {
      const { currentUserIsShared: isShared } = sharedClassData;
      const headerClass = css.wrappedHeader;
      const shareIcon = isShared ? <ButtonUnShareIcon /> : <ButtonShareIcon />;
      const shareTip = isShared ? "Stop sharing" : "Share this";
      const viewTip = "View class work";
      return (
        <div className={headerClass}>
          <ToggleButton
            onClick={this.toggleShared}
            enabled={true}
            tip={shareTip}
          >
            {shareIcon}
          </ToggleButton>
          <ToggleButton
            onClick={this.toggleShowView}
            enabled={isShared}
            tip={viewTip}
          >
            <ViewClassIcon/>
          </ToggleButton>
        </div>
      );
    }
  }

  private toggleShared = () => {
    const { sharedClassData } = this.state;
    if (!sharedClassData) {
      return;
    }
    const { type } = sharedClassData;
    const { getReportingUrl } = this.props;

    const toggleShare = (iframeUrl: string) => {
      const shared = this.props.store.toggleShare(iframeUrl);
      if (shared && !this.state.dontShowShareModal) {
        this.setState({showShareModal: true});
      }
    };

    if (type === "demo") {
      toggleShare("https://sagemodeler.concord.org/branch/use-codap-470/?launchFromLara=eyJyZWNvcmRpZCI6ODMwMTYsImFjY2Vzc0tleXMiOnsicmVhZE9ubHkiOiI5YTQzMjdhYmE0NGZlOTJlYzhiMDkxNWM0MjA1OWYwZGY1MThmMTdmIn19");
    } else {
      const reportingUrlPromise = getReportingUrl();
      if (reportingUrlPromise) {
        reportingUrlPromise
          .then(reportingUrl => {
            if (reportingUrl) {
              toggleShare(reportingUrl);
            }
          })
          .catch((err) => alert(err.toString()));
      }
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
