import * as React from "react";
import { SharedClassData, SharedStudentData } from "../../stores/firestore";
import { SplitPane } from "../split-pane";
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
              return (
                <div className={className}
                  key={student.userId}
                  onClick={handleSelectStudent(student)}
                >
                  <div className={css.studentIcon} />
                  <div className={css.student}>
                    {student.displayName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={`${css.leftNavContents} ${css.bottom}`}>
          (Bottom panel)
        </div>
      </SplitPane>
    </div>
  )
}