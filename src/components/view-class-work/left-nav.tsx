import * as React from "react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { CommentReceived, SharedClassData, store } from "../../stores/firestore";
import { SplitPane } from "../split-pane";
import IconAccountId from "../icons/account-id-badge.svg";
import IconAccountIdPosted from "../icons/account-id-badge-posted.svg";
import IconPosted from "../icons/posted-comment-badge.svg";
import IconSend from "../icons/send-icon.svg";
import IconDelete from "../icons/delete-icon.svg";
import * as css from "./left-nav.sass";
import DeleteConfirmModal from "./delete-confirm-modal";

export interface ILeftNavProps {
  sharedClassData: SharedClassData | null;
  selectedStudentId: string | null;
  onSelectStudent: (selectedStudent: string) => void;
}

export const LeftNav = (props: ILeftNavProps) => {
  const {sharedClassData, selectedStudentId, onSelectStudent} = props;
  if (!sharedClassData) return null;

  const newCommentLineRef = useRef<HTMLDivElement>(null);
  const lastCommentRef = useRef<HTMLDivElement>(null);
  const textBoxRef = useRef<HTMLTextAreaElement>(null);

  const currentUserId = sharedClassData.students.find(s => s.isCurrentUser)?.userId;
  const selectedStudent = sharedClassData.students.find(s => s.userId === selectedStudentId);

  const [selectedStudentPreviousReadTime, setSelectedStudentPreviousReadTime] = useState(0);

  const handleSelectStudent = (studentId: string) => {
    return () => {
      // first record the previous time when we had seen comments, so we can position the "new comments" line
      const newlySelectedStudent = sharedClassData.students.find(s => s.userId === studentId);
      if (newlySelectedStudent) {
        setSelectedStudentPreviousReadTime(newlySelectedStudent.lastCommentSeen);
      }
      // then send to db that we have read the new student's comments
      store.markCommentsRead(studentId);
      // then select student and display any comments
      onSelectStudent(studentId);
    }
  }

  const [newComment, setNewComment] = useState("");
  const handleNewCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)
  const handleSendComment = () => {
    if (!selectedStudent) return;
    store.postComment(selectedStudent.userId, newComment);
    setNewComment("");
    setSelectedStudentPreviousReadTime(-1);
  };

  const [commentToBeDeleted, setCommentToBeDeleted] = useState<CommentReceived | null>(null);
  const [showingDeleteConfirm, setShowingDeleteConfirm] = useState(false);
  const handleConfirmDelete = () => {
    if (commentToBeDeleted) {
      store.deleteComment(commentToBeDeleted);
    }
    setShowingDeleteConfirm(false);
  };
  const handleCloseDelete = () => { setShowingDeleteConfirm(false) };
  const handleDeleteComment = (comment: CommentReceived) => {
    return () => {
      setCommentToBeDeleted(comment);
      setShowingDeleteConfirm(true);
    }
  };

  const currentStudentCommentsLength = selectedStudent ? selectedStudent.commentsReceived.length : 0;
  useEffect(() => {
    // each time select student's comment list changes, mark as read
    if (selectedStudentId) {
      store.markCommentsRead(selectedStudentId);
    }
    if (!selectedStudent || !selectedStudent.commentsReceived.length || !lastCommentRef.current || !textBoxRef.current) return;

    // if our own comment is the last one, scroll to it
    const ownCommentIsLast = selectedStudent.commentsReceived[selectedStudent.commentsReceived.length - 1].sender === currentUserId;
    // or if the previous message is in view
    const lastCommentBox = lastCommentRef.current.getBoundingClientRect();
    const inputBox = textBoxRef.current.getBoundingClientRect();
    const previousMessageInView = lastCommentBox.y - inputBox.y < lastCommentBox.height;
    if (ownCommentIsLast || previousMessageInView)   {
      lastCommentRef.current.scrollIntoView()
    }
  }, [currentStudentCommentsLength, lastCommentRef.current]);

  const commentList = selectedStudent && selectedStudent.commentsReceived.map((comment, i) => {
    const sender = sharedClassData.students.find(s => s.userId === comment.sender);
    const senderName = sender ? sender.displayName : "Unknown";
    const isOwnComment = sender?.isCurrentUser;
    const isLastComment = i === selectedStudent.commentsReceived.length - 1;
    return (
      <div className={css.comment} key={`${selectedStudent.userId}-comment-${i}`}
          ref={isLastComment ? lastCommentRef : null}>
        {
          isOwnComment &&
          <IconDelete onClick={handleDeleteComment(comment)}/>
        }
        <div>
          <div className={css.sender}>
            {senderName}
          </div>
          <div>
            {comment.message}
          </div>
        </div>
      </div>
    );
  });

  // add new comment line
  let firstNewCommentIndex = -1;
  if (selectedStudent) {
    for (let i = 0; i < selectedStudent.commentsReceived.length; i++) {
      if (selectedStudent.commentsReceived[i].time > selectedStudentPreviousReadTime) {
        firstNewCommentIndex = i;
        break;
      }
    }
  }
  if (commentList && commentList.length > 0 && firstNewCommentIndex > 0) {
    commentList.splice(firstNewCommentIndex, 0, <div className={css.newCommentLine} ref={newCommentLineRef} />);
  }

  // when new user is selected, scroll to new comment line if there is one, or the bottom if there are no new comments
  useEffect(() => {
    if (newCommentLineRef.current) {
      newCommentLineRef.current.scrollIntoView()
    } else if (firstNewCommentIndex === -1 && lastCommentRef.current) {
      lastCommentRef.current.scrollIntoView()
    }
  }, [currentUserId, newCommentLineRef.current, lastCommentRef.current]);

  const submitEnabled = selectedStudent && newComment;

  return (
    <div className={css.leftNav}>
      {showingDeleteConfirm &&
        <DeleteConfirmModal
          onConfirm={handleConfirmDelete}
          onClose={handleCloseDelete}
        />
      }
      <SplitPane>
        <div className={`${css.leftNavContents} ${css.top}`}>
          <div className={css.students}>
            {sharedClassData.students.map((student) => {
              const className = student === selectedStudent ? css.selected : "";
              const hasCommented = currentUserId && student.commentsReceived.some(comment => comment.sender === currentUserId);
              let icon: JSX.Element | null = null;
              if (student.isCurrentUser && hasCommented) {
                icon = <IconAccountIdPosted />;
              } else if (student.isCurrentUser) {
                icon = <IconAccountId />;
              } else if (hasCommented) {
                icon = <IconPosted />;
              }
              const lastSeen = student.lastCommentSeen;
              const unreadComments = student.commentsReceived.reduce((total, curr) => {
                if (curr.time > lastSeen) return total + 1;
                return total;
              }, 0);
              const unreadCommentsLabel = unreadComments > 0 ? `(${unreadComments})` : "";
              return (
                <div className={className}
                  key={student.userId}
                  onClick={handleSelectStudent(student.userId)}
                >
                  <div className={css.studentIcon}>
                    {icon}
                  </div>
                  <div className={css.student}>
                    {student.displayName}
                  </div>
                  {unreadCommentsLabel &&
                    <div className={css.unread}>
                      {unreadCommentsLabel}
                    </div>
                  }
                </div>
              );
            })}
          </div>
        </div>
        <div className={`${css.leftNavContents} ${css.bottom}`}>
          <div className={css.commentList}>
            { commentList }
          </div>
          <textarea className={css.commentInput}
            placeholder="Enter comment"
            value={newComment}
            onChange={handleNewCommentChange}
            disabled={!selectedStudent}
            ref={textBoxRef}
          />
          <button className={css.submitButton}
              onClick={handleSendComment}
              disabled={!submitEnabled}>
            <IconSend />
            <div>Post comment</div>
          </button>
        </div>
      </SplitPane>
    </div>
  )
}