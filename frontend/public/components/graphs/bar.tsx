import * as _ from 'lodash-es';
import * as React from 'react';
import { ChartBarIcon } from '@patternfly/react-icons';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartLabel,
  ChartThemeColor,
  ChartThemeVariant,
  getCustomTheme,
} from '@patternfly/react-charts';

import { useRefWidth } from '../utils/ref-width-hook';
import { usePrometheusPoll } from './prometheus-poll-hook';
import { PrometheusEndpoint } from './helpers';
import { PrometheusGraph, PrometheusGraphLink } from './prometheus-graph';
import { barTheme } from './themes';
import { humanizeNumber, Humanize } from '../utils';
import { DomainPadding, DataPoint } from '.';
import { getInstantVectorStats } from './utils';
import { GraphEmpty } from './graph-empty';

const BAR_PADDING = 8; // Space between each bar (top and bottom)
const BAR_LABEL_PADDING = 8;
const DEFAULT_BAR_WIDTH = 10;
const DEFAULT_DOMAIN_PADDING: DomainPadding = { x: [20, 10] };
const PADDING_RATIO = 1 / 3;

export const BarChart: React.FC<BarChartProps> = ({
  barWidth = DEFAULT_BAR_WIDTH,
  title,
  query,
  data = [],
  domainPadding = DEFAULT_DOMAIN_PADDING,
  theme = getCustomTheme(ChartThemeColor.blue, ChartThemeVariant.light, barTheme),
  titleClassName,
  loading = false,
}) => {
  const [containerRef, width] = useRefWidth();

  // Max space that horizontal padding should take up. By default, 2/3 of the horizontal space is always available for the actual bar graph.
  const maxHorizontalPadding = PADDING_RATIO * width;

  // SVG text element is slightly taller than font size
  const xAxisTickLabelHeight = _.get(theme, 'independentAxis.style.tickLabels.fontSize') || _.get(theme, 'axis.style.tickLabels.fontSize', 14) * 1.25;
  const barFootprint = barWidth + xAxisTickLabelHeight + BAR_PADDING + BAR_LABEL_PADDING;
  const topPadding = xAxisTickLabelHeight + BAR_LABEL_PADDING; // Moving the label above the bar

  // Calculate total graph height, accounting for domain padding.
  const height = barFootprint * data.length + topPadding;
  const padding = {
    bottom: 0,
    left: 0,
    right: Math.min(100, maxHorizontalPadding),
    top: topPadding,
  };

  const tickLabelComponent = <ChartLabel x={0} verticalAnchor="start" transform={`translate(0, -${xAxisTickLabelHeight + BAR_LABEL_PADDING})`} />;
  const labelComponent = <ChartLabel x={width} />;
  return (
    <PrometheusGraph ref={containerRef} title={title} className={titleClassName} >
      {
        data.length ? (
          <PrometheusGraphLink query={query}>
            <Chart
              domainPadding={domainPadding}
              height={height}
              theme={theme}
              width={width}
              padding={padding}
            >
              <ChartAxis tickLabelComponent={tickLabelComponent} />
              <ChartBar
                barWidth={barWidth}
                data={data}
                horizontal
                labelComponent={labelComponent}
              />
            </Chart>
          </PrometheusGraphLink>
        ) : (
          <GraphEmpty icon={ChartBarIcon} loading={loading} height={100} />
        )
      }
    </PrometheusGraph>
  );
};

export const Bar: React.FC<BarProps> = ({
  humanize = humanizeNumber,
  metric,
  namespace,
  barWidth,
  domainPadding,
  theme,
  query,
  title,
}) => {
  const [response,, loading] = usePrometheusPoll({ endpoint: PrometheusEndpoint.QUERY, namespace, query });
  const data = getInstantVectorStats(response, metric, humanize);

  return (
    <BarChart
      title={title}
      query={query}
      data={data}
      barWidth={barWidth}
      domainPadding={domainPadding}
      theme={theme}
      loading={loading}
    />
  );
};

type BarChartProps = {
  barWidth?: number;
  domainPadding?: DomainPadding;
  query: string;
  theme?: any; // TODO figure out the best way to import VictoryThemeDefinition
  title?: string;
  data?: DataPoint[];
  titleClassName?: string;
  loading?: boolean;
}

type BarProps = {
  humanize?: Humanize;
  metric: string;
  namespace?: string;
  barWidth?: number;
  domainPadding?: DomainPadding;
  query: string;
  theme?: any; // TODO figure out the best way to import VictoryThemeDefinition
  title?: string;
  titleClassName: string;
}
