import * as React from "react";
import * as ReactDOM from "react-dom";

import { IAuthoredState} from "./types";
import InteractiveAndWrapper from "./components/interactive-and-wrapper";
import { FirestoreStore } from "./stores/firestore";

const authoredState: IAuthoredState = {
  textContent: "Sharing"
};

const store = new FirestoreStore({isDemo: true});
store.init();

ReactDOM.render(
  <div>
    <InteractiveAndWrapper authoredState={authoredState} store={store} />
  </div>,
  document.getElementById("plugin")
);
