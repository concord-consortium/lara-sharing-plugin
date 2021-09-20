import * as React from "react";
import * as ReactDOM from "react-dom";

import { IAuthoredState} from "./types";
import InteractiveAndWrapper from "./components/authoring/interactive-and-wrapper";
import { FirestoreStore } from "./stores/firestore";

const authoredState: IAuthoredState = {
};

const store = new FirestoreStore();
store.init({type: "demo"})
  .then(() => {
    ReactDOM.render(
      <div>
        <InteractiveAndWrapper authoredState={authoredState} store={store} />
      </div>,
      document.getElementById("plugin")
    );
  })
  .catch((err) => alert(err.toString()));
