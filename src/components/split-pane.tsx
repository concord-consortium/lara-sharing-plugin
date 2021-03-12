import * as React from "react";
import { useEffect, useRef, useState } from "react";
import IconSplitterHandle from "./icons/spltter-grabber-handle.svg";
import * as css from "./split-pane.sass";

interface SplitPaneProps {
  children?: JSX.Element[];
}

export const SplitPane: React.FC<SplitPaneProps> = ({ children, ...props }) => {
  if (!children || children.length !== 2) return null;

  const topPaneRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [topHeight, setTopHeight] = useState<number | null>(null);
  const separatorYPosition = useRef<number | null>(null);

  useEffect(() => {
    if (topPaneRef.current) {
      if (!topHeight) {
        setTopHeight(topPaneRef.current.clientHeight);
        topPaneRef.current.style.flex = "none";
      } else {
        topPaneRef.current.style.height = `${topHeight}px`;
      }
    }
  }, [topPaneRef, topHeight]);

  const onMouseDown = (e: any) => {
    separatorYPosition.current = e.clientY || e.touches[0]?.clientY;

    document.addEventListener("mousemove", onMouseMove, {capture: true});
    document.addEventListener("touchmove", onMouseMove, {capture: true});
    document.addEventListener("mouseup", onMouseUp, {once: true});
    document.addEventListener("touchend", onMouseUp, {once: true});
  };

  const onMouseMove = (e: any) => {
    if (!separatorYPosition.current || !containerRef.current || !topHeight) {
      return;
    }
    e.stopImmediatePropagation();

    const minHeight = 20;
    const maxHeight = containerRef.current.clientHeight - 20;

    const y = e.clientY || e.touches[0]?.clientY;
    const newTopHeight = topHeight + y - separatorYPosition.current;

    if (newTopHeight <= minHeight) {
      return topHeight !== minHeight && setTopHeight(minHeight);
    }

    if (newTopHeight >= maxHeight) {
      return topHeight !== maxHeight && setTopHeight(maxHeight);
    }

    setTopHeight(newTopHeight);
  };

  const onMouseUp = (e: any) => {
    separatorYPosition.current = null;

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("touchmove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("touchend", onMouseUp);
  };

  return (
    <div {...props} className={css.splitPane} ref={containerRef}>
      <div className={css.splitPaneTop} ref={topPaneRef}>
        {children[0]}
      </div>
      <div className={css.separator}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}>
          <IconSplitterHandle />
      </div>
      <div className={css.splitPaneBottom}>
        {children[1]}
      </div>
    </div>
  );
}
