import * as React from "react";
import * as css from "./delete-confirm-modal.sass";
import CloseIcon from "../icons/button-close.svg";

export interface IDeleteConfirmModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteConfirmModal = (props: IDeleteConfirmModalProps) => {
  return (
    <div className={css.overlay}>
      <div className={css.deleteModal}>
        <div className={css.dialog}>
          <div className={css.titleBar}>
            <div className={css.titleBarContents}>
            <div className={css.center}>Delete Comment</div>
              <CloseIcon className={`${css.right} ${css.icon}`} onClick={props.onClose} />
            </div>
          </div>
          <div className={css.contents}>
            <p>Are you sure you want to delete this comment?</p>
            <div className={css.submit}>
              <button onClick={props.onClose}>Cancel</button>
              <button onClick={props.onConfirm}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
