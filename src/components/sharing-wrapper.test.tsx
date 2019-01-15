import * as React from "react";
import {
  SharingWrapper,
  ISharingWrapperProps
} from "./sharing-wrapper";
import { shallow } from "enzyme";
import { IAuthoredState } from "../types";
const testingText =  "Hello World!";

const props: ISharingWrapperProps = {
  authoredState: {
    textContent: testingText
  },
  wrappedEmbeddableDiv: document.createElement("div")
};

describe("Sharing Wrapper renders div", () => {
  it("renders Hello World", () => {
    const wrapper = shallow(
      <SharingWrapper authoredState={props.authoredState}/>
      );
    expect(wrapper.text()).toEqual(testingText);
  });
});
