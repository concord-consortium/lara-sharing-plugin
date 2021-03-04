import * as React from "react";
import { SharedClassData, SharedStudentData } from "../../stores/firestore";
import { SplitPane } from "../split-pane";
import IconAccountId from "../icons/account-id-badge.svg";
import IconSend from "../icons/send-icon.svg";
import * as css from "./left-nav.sass";

export interface ILeftNavProps {
  sharedClassData: SharedClassData | null;
  selectedStudent: SharedStudentData | null;
  onSelectStudent: (selectedStudent: SharedStudentData | null) => void;
}

export const LeftNav = (props: ILeftNavProps) => {
  const {sharedClassData, selectedStudent, onSelectStudent} = props;
  if (!sharedClassData) return null;

  const handleSelectStudent = (student: SharedStudentData | null) => {
    return () => onSelectStudent(student);
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
                  onClick={handleSelectStudent(student)}
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
            placeholder="Enter comment" />
          <button className={css.submitButton}>
            <IconSend />
            <div>Post comment</div>
          </button>
        </div>
      </SplitPane>
    </div>
  )
}