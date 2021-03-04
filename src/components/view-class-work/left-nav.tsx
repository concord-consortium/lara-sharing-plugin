import * as React from "react";
import { ChangeEvent, useState } from "react";
import { SharedClassData, SharedStudentData, store } from "../../stores/firestore";
import { SplitPane } from "../split-pane";
import IconAccountId from "../icons/account-id-badge.svg";
import IconSend from "../icons/send-icon.svg";
import * as css from "./left-nav.sass";

export interface ILeftNavProps {
  sharedClassData: SharedClassData | null;
  selectedStudentId: string | null;
  onSelectStudent: (selectedStudent: string) => void;
}

export const LeftNav = (props: ILeftNavProps) => {
  const {sharedClassData, selectedStudentId, onSelectStudent} = props;
  if (!sharedClassData) return null;

  const selectedStudent = sharedClassData.students.find(s => s.userId === selectedStudentId);

  const handleSelectStudent = (studentId: string) => {
    return () => onSelectStudent(studentId);
  }

  const [newComment, setNewComment] = useState("");
  const handleNewCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)
  const handleSendComment = () => {
    if (!selectedStudent) return;
    store.postComment(selectedStudent.userId, newComment);
    setNewComment("");
  }

  return (
    <div className={css.leftNav}>
      <SplitPane>
        <div className={`${css.leftNavContents} ${css.top}`}>
          <div className={css.students}>
            {sharedClassData.students.map((student) => {
              const className = student === selectedStudent ? css.selected : "";
              const icon = student.isCurrentUser ? <IconAccountId /> : null;
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
                return (
                  <div className={css.comment} key={`${selectedStudent.userId}-comment-${i}`}>
                    <div className={css.sender}>
                      {senderName}
                    </div>
                    <div>
                      {comment.message}
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