import * as React from "react";
import * as css from "./toggle-button.sass";
import * as ReactTooltip from "react-tooltip";

interface IToggleButtonProps {
  onClick: (() => void) | undefined;
  enabled: boolean;
  tip: string;
  children: string[] | JSX.Element[] | JSX.Element | undefined;
}

const ToggleButton = (props: IToggleButtonProps) => {
  const {onClick, enabled, tip, children}  = props;
  if (enabled) {
    return(
      <span data-tip={tip} className={css.button} onClick={onClick}>
        {children}
        <ReactTooltip delayShow={800} globalEventOff="click"/>
      </span>
    );
  }
  return (
    <span className={`${css.button} ${css.disabled}`}>
      {children}
    </span>
  );
};

export default ToggleButton;
