import * as moment from 'moment';
import padEnd from 'lodash/padEnd';
import padStart from 'lodash/padStart';

export type valueType = number | string | moment.Moment;

export type Formatter = false | 'number' | 'countdown' | ((value: valueType, config?: FormatConfig) => string);

export interface FormatConfig {
  formatter?: Formatter;
  decimalSeparator?: string;
  precision?: number;
}

export interface CountdownFormatConfig extends FormatConfig {
  format: string;
}

// We trade number as string to avoid precision issue
function formatNumber(value: valueType, config: FormatConfig) {
  const { decimalSeparator = '.', precision } = config;

  const val: string = String(value);
  const cells = val.match(/^(\d*)(\.(\d+))?$/);
  if (!cells) return value;

  let int = cells[1] || '0';
  let decimal = cells[3] || '';

  int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (typeof precision === 'number') {
    decimal = padEnd(decimal, precision, '0').slice(0, precision);
  }

  if (decimal) {
    decimal = `${decimalSeparator}${decimal}`;
  }

  return `${int}${decimal}`;
}

export function formatValue(value: valueType, config: FormatConfig) {
  const { formatter = 'number' } = config;

  // Customize formatter
  if (typeof formatter === 'function') {
    return formatter(value);
  }
  
  return formatNumber(value, config);
}

// Countdown
const timeUnits: [string, number][] = [
  ['Y', 1000 * 60 * 60 * 24 * 365], // years
  ['M', 1000 * 60 * 60 * 24 * 30], // months
  ['D', 1000 * 60 * 60 * 24], // days
  ['H', 1000 * 60 * 60], // hours
  ['m', 1000 * 60], // minutes
  ['s', 1000], // seconds
  ['S', 1], // million seconds
];

function formatTimeStr(duration: number, format: string) {
  let leftDuration: number = duration;
  let str: string = format;

  timeUnits.forEach(([name, unit]) => {
    if (str.indexOf(name) !== -1) {
      const value = Math.floor(leftDuration / unit);
      leftDuration -= value * unit;
      str = str.replace(new RegExp(`${name}+`, 'g'), function(match: string) {
        const len = match.length;
        return padStart(value.toString(), len, '0');
      });
    }
  });

  return str;
}

export function formatCountdown(value: valueType, config: CountdownFormatConfig) {
  const { format = 'HH:mm:ss' } = config;
  const target = moment(value).valueOf();
  const current = moment().valueOf();
  const diff = Math.max(target - current, 0);
  // const duration = moment.duration(diff, 'milliseconds');

  return formatTimeStr(diff, format);

  // return `${padTime(duration.hours())}:${padTime(duration.minutes())}:${padTime(duration.seconds())}`;
}
