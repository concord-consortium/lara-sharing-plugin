import * as React from "react";
import * as css from "./sharing-wrapper.sass";
import { IAuthoredState } from "../types";
import ButtonShareIcon from "./icons/button-share.svg";
import ButtonUnShareIcon from "./icons/button-unshare.svg";
import ViewClassIcon from "./icons/view-class.svg";
import NewCommentBadge from "./icons/new-comment-badge.svg";
import ViewClass from "./view-class-work/view-class";
import ShareModal from "./share-modal";
import ToggleButton from "./toggle-button";

import { SharedClassData, FirestoreStore, FirestoreStoreCancelListener,  } from "../stores/firestore";

export interface ISharingWrapperProps {
  authoredState: IAuthoredState;
  wrappedEmbeddableDiv: HTMLElement | null;
  store: FirestoreStore | null;
}

interface IState {
  showViewClass: boolean;
  showShareModal: boolean;
  dontShowShareModal: boolean;
  sharedClassData: SharedClassData | null;
  interactiveAvailable: boolean;
  interactiveWidth: string;
}

export class SharingWrapper extends React.Component<ISharingWrapperProps, IState> {
  public state: IState = {
    showViewClass: false,
    showShareModal: false,
    dontShowShareModal: false,
    sharedClassData: null,
    interactiveAvailable: false,
    interactiveWidth: "100%"
  };

  storeInitialized = false;

  private cancelListener: FirestoreStoreCancelListener;
  private wrappedEmbeddableDivContainer = React.createRef<HTMLDivElement>();

  public componentWillUnmount() {
    this.cancelListener();
  }

  public observeWrappedInteractiveSize() {
    const { wrappedEmbeddableDiv } = this.props;
    if (!wrappedEmbeddableDiv) {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === "style" && wrappedEmbeddableDiv.style.width) {
          this.setState({
            interactiveWidth: wrappedEmbeddableDiv.style.width.toString()
          });
        }
      });
    });
    const observerConfig = {
      attributes: true,
      attributeFilter: ["style"]
    };
    observer.observe(wrappedEmbeddableDiv, observerConfig);
  }

  public setupStore() {
    if (!this.storeInitialized && this.props.store != null) {
      this.cancelListener = this.props.store.listen((sharedClassData) => {
        this.setState({ sharedClassData });
      });

      this.handleInteractiveAvailable(this.props.store.interactiveAvailable);
      this.props.store.listenForInteractiveAvailable(this.handleInteractiveAvailable);

      this.storeInitialized = true;
    }
  }

  public componentDidMount() {
    const { wrappedEmbeddableDiv } = this.props;
    if (!wrappedEmbeddableDiv) {
      return;
    }
    const containerNode = this.wrappedEmbeddableDivContainer.current!;
    containerNode.appendChild(wrappedEmbeddableDiv);

    this.setupStore();
    this.observeWrappedInteractiveSize();
  }

  public componentDidUpdate(prevProps: ISharingWrapperProps) {
    // Setup communication with store if it becomes available later.
    this.setupStore();
  }

  public render() {
    const { store } = this.props;
    const { showShareModal, showViewClass, sharedClassData } = this.state;

    const wrapperClass = css.wrapper;
    return (
      <div className={wrapperClass}>
        <div ref={this.wrappedEmbeddableDivContainer} />
        {this.renderIcons()}
        {showShareModal ? <ShareModal onClose={this.handleCloseShowModal} sharedClassData={sharedClassData} /> : null}
        {store && showViewClass ? <ViewClass onClose={this.handleCloseViewClass} store={store} sharedClassData={sharedClassData} /> : null}
      </div>
    );
  }

  private renderIcons() {
    const { sharedClassData, interactiveAvailable, interactiveWidth } = this.state;

    if (sharedClassData) {
      const { currentUserIsShared } = sharedClassData;
      const headerClass = css.wrappedHeader;
      const shareIcon = currentUserIsShared ? <ButtonUnShareIcon /> : <ButtonShareIcon />;
      const shareTip = currentUserIsShared ? "Stop sharing" : "Share this";
      const viewTip = "View class work";

      let hasNewComments = false;
      const currentUser = sharedClassData.students.find(s => s.isCurrentUser);
      if (currentUser && currentUserIsShared) {
        const lastSeen = currentUser.lastCommentSeen;
        hasNewComments = !currentUser.commentsReceived.every(comment => {
          return comment.time < lastSeen;
        });
      }

      return (
        <div className={headerClass} style={{width: interactiveWidth}}>
          <div className={css.icons}>
            <ToggleButton
              onClick={this.toggleShared}
              enabled={interactiveAvailable}
              tip={shareTip}
            >
              {shareIcon}
            </ToggleButton>
            <ToggleButton
              onClick={this.toggleShowView}
              enabled={interactiveAvailable && currentUserIsShared}
              tip={viewTip}
            >
              <ViewClassIcon/>
              {
                hasNewComments ?
                  <NewCommentBadge className={css.newCommentBadge} /> :
                  null
              }
            </ToggleButton>
          </div>
        </div>
      );
    }
  }

  private toggleShared = () => {
    const { sharedClassData } = this.state;
    const { store } = this.props;
    if (!sharedClassData || !store) {
      return;
    }
    const { type } = sharedClassData;
    const { getReportingUrl } = store;

    const toggleShare = async (iframeUrl: string) => {
      const shared = await store.toggleShare(iframeUrl);
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

  private handleInteractiveAvailable = (interactiveAvailable: boolean) => {
    this.setState({interactiveAvailable});
  }

  private elementVisible(element: HTMLElement) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  }
}
export default SharingWrapper;
