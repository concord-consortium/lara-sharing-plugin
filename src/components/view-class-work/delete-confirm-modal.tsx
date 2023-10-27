import * as React from "react";
import * as css from "./delete-confirm-modal.sass";
import CloseIcon from "../icons/button-close.svg";
import { PluginContext } from "../../hooks/use-plugin-context";

export interface IDeleteConfirmModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export class DeleteConfirmModal extends React.Component<IDeleteConfirmModalProps, {}> {
  declare context: React.ContextType<typeof PluginContext>
  static contextType = PluginContext;

  public render() {
    const style: React.CSSProperties = {zIndex: this.context.startingZIndex + 100};

    return (
      <div className={css.overlay}>
        <div className={css.deleteModal} style={style}>
          <div className={css.dialog}>
            <div className={css.titleBar}>
              <div className={css.titleBarContents}>
              <div className={css.center}>Delete Comment</div>
                <CloseIcon className={`${css.right} ${css.icon}`} onClick={this.props.onClose} />
              </div>
            </div>
            <div className={css.contents}>
              <p>Are you sure you want to delete this comment?</p>
              <div className={css.submit}>
                <button onClick={this.props.onClose}>Cancel</button>
                <button onClick={this.props.onConfirm}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DeleteConfirmModal;
