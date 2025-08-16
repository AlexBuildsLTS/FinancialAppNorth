import React from 'react';

import styles from './inter.css';

export interface interProps {
  prop?: string;
}

export function inter({prop = 'default value'}: interProps) {
  return <div className={styles.inter}>inter {prop}</div>;
}
