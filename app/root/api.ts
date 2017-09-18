import 'whatwg-fetch';

import {UnrestrictedDictionary} from '../common/ObjectTypes';
import {Graph} from './models/Graph';
import {Settings} from './models/Settings';

async function fetchJson(url: string): Promise<any> {
    const response = await fetch(url);
    if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
    }

    return await response.json();
}

export function fetchSettings(): Promise<Settings>
{
    return fetchJson('data/config.json') as Promise<Settings>;
}

export function fetchGraph(urlGraph: string): Promise<Graph> {
    return fetchJson(urlGraph) as Promise<Graph>;
}
