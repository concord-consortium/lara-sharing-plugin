import * as React from "react";
import * as css from "./share-modal.sass";
import SharedIcon from "./icons/shared.svg";
import CloseIcon from "./icons/button-close.svg";
import { SharedClassData } from "../stores/firestore";

export interface IShareModalProps {
  onClose: (dontShowAgain: boolean) => void;
  sharedClassData: SharedClassData | null;
}

export class ShareModal extends React.Component<IShareModalProps, {}> {
  private checkbox: HTMLInputElement | null;

  public render() {
    const { sharedClassData } = this.props;
    const interactiveName = sharedClassData ? sharedClassData.interactiveName : null;
    const haveInteractiveName = (interactiveName !== null) && (interactiveName.length > 0);

    const message = `Your work ${haveInteractiveName ? `for ${interactiveName}` : ""} has been shared with your class.`;

    return (
      <dialog className={css.shareModal} open={true}>
        <form method="dialog">
          <div className={css.dialog}>
            <div className={css.titleBar}>
              <div className={css.titleBarContents}>
                <SharedIcon className={`${css.left} ${css.icon}`} />
                <div className={css.center}>Your Shared Work</div>
                <button onClick={this.handleClose}><CloseIcon className={`${css.right} ${css.icon}`} /></button>
              </div>
            </div>
            <div className={css.contents}>
              <p>{message}</p>
              <p>Click the button again to unshare your work.</p>
              <p>You may now view other students' shared work by clicking the View button.</p>
              <p><input type="checkbox" ref={(el) => this.checkbox = el} /> Do not show this message again.</p>
            </div>
          </div>
        </form>
      </dialog>
    );
  }

  private handleClose = () => {
    const dontShowAgain = this.checkbox ? this.checkbox.checked : false;
    this.props.onClose(dontShowAgain);
  }
}

export default ShareModal;
