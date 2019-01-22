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
    const wrapper = shallow(
      <SharingWrapper authoredState={props.authoredState} store={props.store} />
    );
    expect(wrapper.find(".wrappedContent .icon").length).toBe(2);
  });
});
