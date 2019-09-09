import 'whatwg-fetch';

import { GraphData } from './graphwalker/models/Graph';
import { Settings } from './graphwalker/models/Settings';

async function fetchJson(url: string, errorPrefix?: string): Promise<any> {
  const prefix = errorPrefix ? `${errorPrefix}: ` : '';

  const response = await fetch(url);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`${prefix}${response.status} - ${response.statusText}`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error(`${prefix}${error}`);
  }
}

export function fetchSettings(): Promise<Settings> {
  return fetchJson('data/config.json', 'Settings file') as Promise<Settings>;
}

export function fetchGraphData(urlGraph: string): Promise<GraphData> {
  return fetchJson(urlGraph, 'Graph data file') as Promise<GraphData>;
}
