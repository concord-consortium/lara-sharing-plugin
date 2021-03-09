import * as React from "react";
import { ChangeEvent, useEffect, useState } from "react";
import { CommentReceived, SharedClassData, store } from "../../stores/firestore";
import { SplitPane } from "../split-pane";
import IconAccountId from "../icons/account-id-badge.svg";
import IconAccountIdPosted from "../icons/account-id-badge-posted.svg";
import IconPosted from "../icons/posted-comment-badge.svg";
import IconSend from "../icons/send-icon.svg";
import IconDelete from "../icons/delete-icon.svg";
import * as css from "./left-nav.sass";

export interface ILeftNavProps {
  sharedClassData: SharedClassData | null;
  selectedStudentId: string | null;
  onSelectStudent: (selectedStudent: string) => void;
}

export const LeftNav = (props: ILeftNavProps) => {
  const {sharedClassData, selectedStudentId, onSelectStudent} = props;
  if (!sharedClassData) return null;

  const currentUserId = sharedClassData.students.find(s => s.isCurrentUser)?.userId;
  const selectedStudent = sharedClassData.students.find(s => s.userId === selectedStudentId);

  const handleSelectStudent = (studentId: string) => {
    return () => {
      store.markCommentsRead(studentId);
      onSelectStudent(studentId);
    }
  }

  const [newComment, setNewComment] = useState("");
  const handleNewCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)
  const handleSendComment = () => {
    if (!selectedStudent) return;
    store.postComment(selectedStudent.userId, newComment);
    setNewComment("");
  };
  const handleDeleteComment = (comment: CommentReceived) => {
    return () => store.deleteComment(comment);
  };

  const currentStudentCommentsLength = selectedStudent ? selectedStudent.commentsReceived.length : 0;
  useEffect(() => {
    // each time select student's comment list changes, mark as read
    if (selectedStudentId) {
      store.markCommentsRead(selectedStudentId);
    }
  }, [currentStudentCommentsLength]);

  return (
    <div className={css.leftNav}>
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
                    {student.displayName} {unreadCommentsLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={`${css.leftNavContents} ${css.bottom}`}>
          <div className={css.commentList}>
            {
              selectedStudent && selectedStudent.commentsReceived.map((comment, i) => {
                const sender = sharedClassData.students.find(s => s.userId === comment.sender);
                const senderName = sender ? sender.displayName : "Unknown";
                const isOwnComment = sender?.isCurrentUser;
                return (
                  <div className={css.comment} key={`${selectedStudent.userId}-comment-${i}`}>
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
              })
            }
          </div>
          <textarea className={css.commentInput}
            placeholder="Enter comment"
            value={newComment}
            onChange={handleNewCommentChange}
            disabled={!selectedStudent}
          />
          <button className={css.submitButton}
              onClick={handleSendComment}
              disabled={!selectedStudent}>
            <IconSend />
            <div>Post comment</div>
          </button>
        </div>
      </SplitPane>
    </div>
  )
}