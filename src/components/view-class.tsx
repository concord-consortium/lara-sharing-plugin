import * as React from "react";
import * as css from "./view-class.sass";
import ViewSharedIcon from "./icons/view-shared.svg";

// TODO: move these interfaces to a data store

export interface SharedClassData {
  interactiveName: string;
  students: SharedStudentData[];
}

export interface SharedStudentData {
  userId: string;
  displayName: string;
  iframeUrl: string;
}

export interface IViewClassProps {
  onClose: () => void;
  sharedClassData?: SharedClassData;
}

interface IState {
  selectedStudent: SharedStudentData | null;
}

export class ViewClass extends React.Component<IViewClassProps, IState> {
  public state: IState = {
    selectedStudent: null
  };

  public render() {
    const { sharedClassData } = this.props;
    const interactiveName = sharedClassData ? sharedClassData.interactiveName : null;
    const haveInteractiveName = (interactiveName !== null) && (interactiveName.length > 0);

    return (
      <div className={css.viewClass}>
        <div className={css.titleBar}>
          <div className={css.titleBarContents}>
            <ViewSharedIcon className={css.icon} />
            <strong>View Shared Classwork{haveInteractiveName ? ": " : ""}</strong>
            {interactiveName}
            <div className={css.titleBarClose} onClick={this.props.onClose}>
              ✖
            </div>
          </div>
        </div>
        <div className={css.leftNav}>
          {this.renderLeftNav()}
        </div>
        <div className={css.viewer}>
          {this.renderViewer()}
        </div>
      </div>
    );
  }

  private renderLeftNav() {
    const { sharedClassData } = this.props;
    const { selectedStudent } = this.state;

    if (!sharedClassData) {
      return <div className={css.leftNavContents} />;
    }

    return (
      <div className={css.leftNavContents}>
        <ul>
          {sharedClassData.students.map((student) => {
            const className = student === selectedStudent ? css.selected : "";
            return (
              <li
                key={student.userId}
                className={className}
                onClick={this.handleSelectStudent(student)}
              >
                {student.displayName}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  private renderViewer() {
    const { sharedClassData } = this.props;
    const { selectedStudent } = this.state;
    if (!sharedClassData) {
      return this.renderViewerMessage("Loading ...");
    }
    if (sharedClassData.students.length === 0) {
      return this.renderViewerMessage("No students have shared their work.");
    }
    if (!selectedStudent) {
      return this.renderViewerMessage("Click on a student's name to view their work.");
    }
    const foundStudent = !!sharedClassData.students.find((student) => student.userId === selectedStudent.userId);
    if (!foundStudent) {
      return this.renderViewerMessage((
        <div>
          <p>{selectedStudent.displayName} has stopped sharing their work.</p>
          <p>Please choose another student's work to view.</p>
        </div>
      ));
    }
    return (
      <div className={css.viewerInteractive}>
        <iframe className={css.viewerInteractiveIFrame} src={selectedStudent.iframeUrl} />
      </div>
    );
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

  private handleSelectStudent = (selectedStudent: SharedStudentData | null) => {
    return () => this.setState({selectedStudent});
  }
}
export default ViewClass;
