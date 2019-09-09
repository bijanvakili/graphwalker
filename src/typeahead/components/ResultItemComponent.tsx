import classnames from 'classnames';
import * as React from 'react';
import '../TypeAhead.less';

import { ElementMouseEventHandler } from '../../types/EventTypes';

export interface ItemProps {
  // data
  displayName: string;
  isSelected: boolean;

  // callbacks
  onClick: ElementMouseEventHandler;
}

export const ResultItemComponent: React.FC<ItemProps> = (props: ItemProps) => {
  return (
    <a href="#" className={classnames('dropdown-item', { active: props.isSelected })} onClick={props.onClick}>
      {props.displayName}
    </a>
  );
};
