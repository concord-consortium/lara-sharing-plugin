import * as React from "react";
import {
  SharingWrapper,
  ISharingWrapperProps
} from "./sharing-wrapper";
import { shallow, mount, render } from "enzyme";
import { IAuthoredState } from "../types";
const testingText =  "Hello World!";

const props: ISharingWrapperProps = {
  authoredState: {
    textContent: testingText
  },
  wrappedEmbeddableDiv: document.createElement("div")
};

describe("Sharing Wrapper", () => {
  it("renders two SVG buttons", () => {
    const wrapper = shallow(
      <SharingWrapper authoredState={props.authoredState}/>
      );
    // expect(wrapper.find(".wrappedContent").length).toBe(1);
    expect(wrapper.find(".wrappedContent .icon").length).toBe(2);
  });
});
