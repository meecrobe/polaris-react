import * as React from 'react';

import {classNames} from '@shopify/react-utilities/styles';
import {autobind, memoize} from '@shopify/javascript-utilities/decorators';
import {createUniqueIDFactory} from '@shopify/javascript-utilities/other';
import {Collapsible, Icon, IconProps} from '../../../../components';
import {contextTypes} from '../../types';

import {ellipsis} from '../../../../icons';

import Item, {Props as ItemProps} from '../Item';

import * as styles from '../../Navigation.scss';

const createAdditionalItemsId = createUniqueIDFactory('AdditionalItems');

export interface Props {
  items: ItemProps[];
  icon?: IconProps['source'];
  title?: string;
  fill?: boolean;
  rollup?: {
    after: number;
    view: string;
    hide: string;
    activePath: string;
  };
  action?: {
    icon: IconProps['source'];
    accessibilityLabel: string;
    onClick(): void;
  };
  separator?: boolean;
}

interface State {
  expanded: boolean;
}

export default class Section extends React.Component<Props, State> {
  static contextTypes = contextTypes;

  state: State = {
    expanded: false,
  };

  private animationFrame: number | null = null;

  componentWillUnmount() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  render() {
    const {title, fill, action, items, rollup, separator} = this.props;
    const {expanded} = this.state;

    const className = classNames(
      styles.Section,
      separator && styles['Section-withSeparator'],
      fill && styles['Section-fill'],
    );

    const actionMarkup = action && (
      <button
        type="button"
        className={styles.Action}
        aria-label={action.accessibilityLabel}
        onClick={action.onClick}
      >
        <Icon source={action.icon} />
      </button>
    );

    const sectionHeadingMarkup = title && (
      <li className={styles.SectionHeading}>
        <span className={styles.Text}>{title}</span>
        {actionMarkup}
      </li>
    );

    const itemsMarkup = items.map((item) => {
      const {onClick, label, ...rest} = item;

      return (
        <Item
          {...rest}
          key={label}
          label={label}
          onClick={this.handleClick(onClick)}
        />
      );
    });

    const toggleClassName = classNames(styles.Item, styles.RollupToggle);
    const ariaLabel = rollup && (expanded ? rollup.hide : rollup.view);

    const toggleRollup = rollup &&
      items.length > rollup.after && (
        <div className={styles.ListItem} key="List Item">
          <button
            type="button"
            className={toggleClassName}
            onClick={this.toggleViewAll}
            aria-label={ariaLabel}
            testID="ToggleViewAll"
          >
            <span className={styles.Icon}>
              <Icon source={ellipsis} />
            </span>
            {ariaLabel}
          </button>
        </div>
      );

    const activeItemIndex = items.findIndex((item: ItemProps) => {
      if (!rollup) {
        return false;
      }

      return (
        rollup.activePath === item.url ||
        (item.url && rollup.activePath.startsWith(item.url)) ||
        (item.subNavigationItems
          ? item.subNavigationItems.some(({url: itemUrl}) =>
              rollup.activePath.startsWith(itemUrl),
            )
          : false)
      );
    });

    const sectionItems = rollup
      ? itemsMarkup.slice(0, rollup.after)
      : itemsMarkup;

    const additionalItems = rollup ? itemsMarkup.slice(rollup.after) : [];

    if (
      rollup &&
      activeItemIndex !== -1 &&
      activeItemIndex > rollup.after - 1
    ) {
      sectionItems.push(
        ...additionalItems.splice(activeItemIndex - rollup.after, 1),
      );
    }

    const additionalItemsId = createAdditionalItemsId();

    const activeItemsMarkup = rollup &&
      additionalItems.length > 0 && (
        <li className={styles.RollupSection}>
          <Collapsible id={additionalItemsId} open={expanded}>
            <ul className={styles.List}>{additionalItems}</ul>
          </Collapsible>
          {toggleRollup}
        </li>
      );

    return (
      <ul className={className}>
        {sectionHeadingMarkup}
        {sectionItems}
        {activeItemsMarkup}
      </ul>
    );
  }

  @memoize()
  private handleClick(onClick: ItemProps['onClick']) {
    return () => {
      if (onClick) {
        onClick();
      }

      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }

      this.animationFrame = requestAnimationFrame(() =>
        this.setState({expanded: false}),
      );
    };
  }

  @autobind
  private toggleViewAll() {
    this.setState(({expanded}) => ({expanded: !expanded}));
  }
}
