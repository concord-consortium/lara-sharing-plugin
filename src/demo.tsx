import * as React from "react";
import * as ReactDOM from "react-dom";

import { IAuthoredState} from "./types";
import InteractiveAndWRapper from "./components/interactive-and-wrapper";

const authoredState: IAuthoredState = {
  textContent: "Interactive Sharing Text Here."
};

ReactDOM.render(
  <div>
    <InteractiveAndWRapper authoredState={authoredState} />
  </div>,
  document.getElementById("plugin")
);
