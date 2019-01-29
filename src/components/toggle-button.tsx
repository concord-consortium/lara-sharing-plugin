import * as React from "react";
import * as css from "./toggle-button.sass";

interface IToggleButtonProps {
  onClick: (() => void) | undefined;
  enabled: boolean;
  tip: string;
  children: Array<string |  JSX.Element> | JSX.Element | undefined;
}

const ToggleButton = (props: IToggleButtonProps) => {
  const {onClick, enabled, tip, children}  = props;
  const className = enabled ? css.button : `${css.button} ${css.disabled}`;
  return(
    <span title={tip} className={className} onClick={onClick}>
      {children}
    </span>
  );
};

export default ToggleButton;
