import * as React from "react";
import * as screenfull from "screenfull";
import { LeftNav } from "./left-nav";
import { SharedClassData, SharedStudentData, FirestoreStore } from "../../stores/firestore";

import * as css from "./view-class.sass";
import ViewSharedIcon from "../icons/view-shared.svg";
import CloseIcon from "../icons/button-close.svg";
import FullScreenIcon from "../icons/fullscreen.svg";


export interface IViewClassProps {
  onClose: () => void;
  store: FirestoreStore;
  sharedClassData: SharedClassData | null;
}

interface IState {
  selectedStudentId: string | null;
}

export class ViewClass extends React.Component<IViewClassProps, IState> {

  public state: IState = {
    selectedStudentId: null
  };

  private iFrameRef: React.RefObject<HTMLIFrameElement> = React.createRef();

  public render() {
    const { sharedClassData } = this.props;
    const interactiveName = sharedClassData ? sharedClassData.interactiveName : null;
    const haveInteractiveName = (interactiveName !== null) && (interactiveName.length > 0);

    return (
      <div className={css.viewClass}>
        <div className={css.titleBar}>
          <div className={css.titleBarContents}>
            <ViewSharedIcon className={`${css.left} ${css.icon}`} />
            <div className={css.center}>
              View Shared Classwork{haveInteractiveName ? ": " : ""}
              {interactiveName}
            </div>
            <CloseIcon className={`${css.right} ${css.icon}`}  onClick={this.props.onClose} />
          </div>
        </div>
        <LeftNav
          sharedClassData={sharedClassData}
          selectedStudentId={this.state.selectedStudentId}
          onSelectStudent={this.handleSelectStudent}
        />
        <div className={css.viewer}>
          {this.renderViewer()}
        </div>
      </div>
    );
  }

  private renderViewer() {
    const { sharedClassData } = this.props;
    const { selectedStudentId } = this.state;
    if (!sharedClassData) {
      return this.renderViewerMessage("Loading ...");
    }
    if (sharedClassData.students.length === 0) {
      return this.renderViewerMessage("No students have shared their work.");
    }
    const selectedStudent = sharedClassData.students.find(s => s.userId === selectedStudentId);
    if (!selectedStudent) {
      return this.renderViewerMessage("Click on a student's name to view their work.");
    }
    const foundStudent = !!sharedClassData.students.find((student) => student.userId === selectedStudent.userId);
    if (!foundStudent || !selectedStudent.iframeUrl) {
      return this.renderViewerMessage((
        <div>
          <p>{selectedStudent.displayName} has stopped sharing their work.</p>
          <p>Please choose another student's work to view.</p>
        </div>
      ));
    }
    return (
      <div className={css.viewerInteractive}>
        <iframe className={css.viewerInteractiveIFrame} src={selectedStudent.iframeUrl} ref={this.iFrameRef}/>
        { this.renderFullScreenIcon() }
      </div>
    );
  }

  private renderFullScreenIcon = () => {
    if (screenfull && screenfull.enabled) {
      return (
        <div className={css.fullScreenButton} onClick={this.handleFullScreenClick}>
          <FullScreenIcon />
        </div>
      );
    }
    return null;
  }

  private renderViewerMessage(message: string|JSX.Element) {
    return (
      <div className={css.viewerMessage}>
        <div className={css.viewerMessageContents}>
          {message}
        </div>
      </div>
    );
  }

  private handleSelectStudent = (selectedStudentId: string | null) => {
    this.setState({selectedStudentId});
  }

  private handleFullScreenClick = () => {
    if (screenfull && screenfull.enabled) {
      if (this.iFrameRef.current) {
        screenfull.request(this.iFrameRef.current as Element);
      }
    }
  }
}
export default ViewClass;
