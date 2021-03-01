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
        <div className={css.leftNavContents}>
          <ul>
            {sharedClassData.students.map((student) => {
              const className = student === selectedStudent ? css.selected : "";
              return (
                <li
                  key={student.userId}
                  className={className}
                  onClick={handleSelectStudent(student)}
                >
                  {student.displayName}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          (Bottom panel)
        </div>
      </SplitPane>
    </div>
  )
}