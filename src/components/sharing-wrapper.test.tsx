import * as React from "react";
import {
  SharingWrapper,
  ISharingWrapperProps
} from "./sharing-wrapper";
import { render } from "enzyme";
import { store } from "../stores/firestore";
const testingText =  "Hello World!";

const props: ISharingWrapperProps = {
  authoredState: {
  },
  wrappedEmbeddableDiv: document.createElement("div"),
  store
};

describe("Sharing Wrapper", () => {
  it("renders two SVG buttons", () => {
    store.init({type: "test"})
    .then(() => {
      const wrapper = render(
        <SharingWrapper
          authoredState={props.authoredState}
          wrappedEmbeddableDiv={props.wrappedEmbeddableDiv}
          store={props.store} />
      );
      expect(wrapper.find(".wrappedHeader .button").length).toBe(2);
    })
    .catch((err) => {
      throw new Error(err.toString());
    });
  });
});
