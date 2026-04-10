import { onCLS, onINP, onFCP, onLCP, onTTFB, type MetricType } from 'web-vitals';

type ReportCallback = (metric: MetricType) => void;

const reportWebVitals = (onPerfEntry?: ReportCallback): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
