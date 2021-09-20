import * as React from "react";
import {
  SharingWrapper,
  ISharingWrapperProps
} from "./sharing-wrapper";
import { mount } from "enzyme";
import { FirestoreStore } from "../stores/firestore";
import ToggleButton from "./toggle-button";

const store = new FirestoreStore();

const props: ISharingWrapperProps = {
  authoredState: {
  },
  wrappedEmbeddableDiv: document.createElement("div"),
  store
};

describe("Sharing Wrapper", () => {
  it("renders two SVG buttons", (done) => {
    store.init({type: "test"})
    .then(() => {
      const wrapper = mount(
        <SharingWrapper
          authoredState={props.authoredState}
          wrappedEmbeddableDiv={props.wrappedEmbeddableDiv}
          store={props.store} />
      );
      expect(wrapper.find(ToggleButton).length).toBe(2);
      done();
    });
  });
});
