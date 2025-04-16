import * as Tabs from '@radix-ui/react-tabs';
import React from 'react';
import styles from './RadixTabs.module.css';

export interface RadixTab {
  label: string;
  value: string;
  content: React.ReactNode;
}

export interface RadixTabsProps {
  tabs: RadixTab[];
  defaultValue?: string;
  className?: string;
  contentClassName?: string;
}

const RadixTabs: React.FC<RadixTabsProps> = ({
  tabs,
  defaultValue,
  className,
  contentClassName,
}) => {
  if (!tabs || tabs.length === 0) return null;
  return (
    <Tabs.Root defaultValue={defaultValue || tabs[0].value} className={className}>
      <Tabs.List className={styles.list}>
        {tabs.map((tab) => (
          <Tabs.Trigger key={tab.value} value={tab.value} className={styles.trigger}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Content
          key={tab.value}
          value={tab.value}
          className={contentClassName ? `${contentClassName} ${styles.tabContent}` : styles.tabContent}
        >
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

export default RadixTabs;
