import * as React from "react";
import {
  SharingWrapper,
  ISharingWrapperProps
} from "./sharing-wrapper";
import { shallow, mount, render } from "enzyme";
import { IAuthoredState } from "../types";
import { store } from "../stores/firestore";
const testingText =  "Hello World!";

store.init({
  type: "test"
});

const props: ISharingWrapperProps = {
  authoredState: {
    textContent: testingText
  },
  wrappedEmbeddableDiv: document.createElement("div"),
  store
};

describe("Sharing Wrapper", () => {
  it("renders two SVG buttons", () => {
    const wrapper = render(
      <SharingWrapper authoredState={props.authoredState} store={props.store} />
    );
    expect(wrapper.find(".wrappedHeader .button").length).toBe(2);
  });
});
