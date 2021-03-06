import * as React from 'react';
import classNames from 'classnames';

export const DashboardCardHeader: React.FC<DashboardCardHeaderProps> = React.memo(({ className, children }) => (
  <div className={classNames('co-dashboard-card__header', className)}>
    {children}
  </div>
));

type DashboardCardHeaderProps = {
  className?: string;
  children: React.ReactNode;
};
