import * as React from "react";
import * as ReactDOM from "react-dom";

import { IAuthoredState} from "./types";
import InteractiveAndWRapper from "./components/interactive-and-wrapper";
import { SharedClassData } from "./components/view-class";

const authoredState: IAuthoredState = {
  textContent: "Sharing"
};

const sharedClassData: SharedClassData = {
  interactiveName: "Demo Interactive",
  students: [
    {
      userId: "1@learn.concord.org",
      displayName: "Amy A.",
      iframeUrl: "https://sagemodeler.concord.org/branch/master/?launchFromLara=eyJyZWNvcmRpZCI6ODMwMTYsImFjY2Vzc0tleXMiOnsicmVhZE9ubHkiOiI5YTQzMjdhYmE0NGZlOTJlYzhiMDkxNWM0MjA1OWYwZGY1MThmMTdmIn19"
    },
    {
      userId: "2@learn.concord.org",
      displayName: "Arianna A.",
      iframeUrl: "https://sagemodeler.concord.org/branch/master/?launchFromLara=eyJyZWNvcmRpZCI6ODMwMTYsImFjY2Vzc0tleXMiOnsicmVhZE9ubHkiOiI5YTQzMjdhYmE0NGZlOTJlYzhiMDkxNWM0MjA1OWYwZGY1MThmMTdmIn19"
    },
    {
      userId: "3@learn.concord.org",
      displayName: "Bobby B.",
      iframeUrl: "https://sagemodeler.concord.org/branch/master/?launchFromLara=eyJyZWNvcmRpZCI6ODMwMTYsImFjY2Vzc0tleXMiOnsicmVhZE9ubHkiOiI5YTQzMjdhYmE0NGZlOTJlYzhiMDkxNWM0MjA1OWYwZGY1MThmMTdmIn19"
    },
  ]
};

for (let i = 4; i <= 30; i++) {
  sharedClassData.students.push({
    userId: `${i}@learn.concord.org`,
    displayName: `Student ${i}`,
    iframeUrl: "https://sagemodeler.concord.org/branch/master/?launchFromLara=eyJyZWNvcmRpZCI6ODMwMTYsImFjY2Vzc0tleXMiOnsicmVhZE9ubHkiOiI5YTQzMjdhYmE0NGZlOTJlYzhiMDkxNWM0MjA1OWYwZGY1MThmMTdmIn19"
  });
}

ReactDOM.render(
  <div>
    <InteractiveAndWRapper authoredState={authoredState} sharedClassData={sharedClassData} />
  </div>,
  document.getElementById("plugin")
);
