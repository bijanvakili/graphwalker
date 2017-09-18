import * as _ from 'lodash';
import {Graph, Vertex} from '../root/models/Graph';

export function typeaheadSearch(graph: Graph, query: string): Vertex[] {
    if (!query) {
        throw new Error('No query provided to typeaheadSearch');
    }

    const pattern = new RegExp(`^${query.toUpperCase()}`);
    const partialMatch = (s: string) => (s || '').toUpperCase().match(pattern);

    // TODO replace with a faster string algorithm or data structure
    return _(graph.vertices)
        .filter((v: Vertex) => _.some(v.searchableComponents || [], partialMatch))
        .sortBy((v: Vertex) => v.label)
        .value();
}
