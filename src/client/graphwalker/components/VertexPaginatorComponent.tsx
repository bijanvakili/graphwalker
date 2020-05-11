import * as React from "react";
import classnames from "classnames";

import { Justification } from "../constants";

interface VertexPaginatorComponentProps {
  justification: Justification;
  isUpEnabled: boolean;
  isDownEnabled: boolean;
  summary: string;

  onClickUp: () => void;
  onClickDown: () => void;
}

const defaultButtonStyles = ["btn", "btn-secondary", "btn-sm"];

export const VertexPaginatorComponent: React.FC<VertexPaginatorComponentProps> = (
  props: VertexPaginatorComponentProps
) => {
  const { justification } = props;
  if (justification === Justification.Center) {
    throw new Error(`${justification} is not supported`);
  }
  const horizontalAlignment = justification === Justification.Left ? "start" : "end";
  return (
    <>
      <div className={classnames("row", `justify-content-${horizontalAlignment}`)}>
        <div className="button-group">
          <button
            className={classnames(...defaultButtonStyles, { disabled: !props.isUpEnabled })}
            onClick={props.onClickUp}
          >
            Up
          </button>
          <button
            className={classnames(...defaultButtonStyles, { disabled: !props.isDownEnabled })}
            onClick={props.onClickDown}
          >
            Down
          </button>
        </div>
      </div>
      <div className={classnames("row", `justify-content-${horizontalAlignment}`)}>
        <span>{props.summary}</span>
      </div>{" "}
    </>
  );
};
