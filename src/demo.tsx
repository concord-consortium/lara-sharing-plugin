import * as React from "react";
import * as ReactDOM from "react-dom";

import { IAuthoredState} from "./types";
import InteractiveAndWrapper from "./components/authoring/interactive-and-wrapper";
import { FirestoreStore } from "./stores/firestore";
import { IPluginContext, PluginContext } from "./hooks/use-plugin-context";

const authoredState: IAuthoredState = {
};

const partialContext: Partial<IPluginContext> = {
  startingZIndex: 100
};

const store = new FirestoreStore();
store.init({type: "demo"})
  .then(() => {
    ReactDOM.render(
      <PluginContext.Provider value={partialContext as IPluginContext}>
        <div>
          <InteractiveAndWrapper authoredState={authoredState} store={store} />
        </div>
      </PluginContext.Provider>,
      document.getElementById("plugin")
    );
  })
  .catch((err) => alert(err.toString()));
