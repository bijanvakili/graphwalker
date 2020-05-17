import { env } from "process";

// tslint:disable:import-name
import fetch from "node-fetch";
// tslint:enable:import-name

import { URLSearchParams } from "url";

interface QueryResponse<T> {
  result?: T[];
  error?: string;
}

// replaces the internal CayleyDB 'id' with the 'hashId' on any deep object tree
// (forcing GraphQL clients to use hashId as the primary key)
function enforceHashIdPrimaryKey(v: any) {
  if (typeof v === "object") {
    if (v.id && v.hashId) {
      v.id = v.hashId;
      delete v.hashId;
    }
    for (const subValue of Object.values(v)) {
      enforceHashIdPrimaryKey(subValue);
    }
  }
}

// TODO add connection pooling (may require node.js http.Agent)

// implementation modified from @cayleygraph/cayley
// https://github.com/cayleygraph/javascript-client
export class CayleyDBClient {
  private baseUrl: string;
  private debugQueries: boolean;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "http://localhost:64210";
    this.debugQueries = (env.GRAPHWALKER_DEBUG_QUERIES || "FALSE").toUpperCase() === "TRUE";
  }

  // runs an async gizmo query
  queryGizmo = async <T>(query: string, limit: number = 100): Promise<T[] | undefined> => {
    if (this.debugQueries) {
      // tslint:disable-next-line:no-console
      console.log(`queryGizmo: ${query}`);
    }

    const params = new URLSearchParams({
      lang: "gizmo",
      limit: String(limit),
    });

    const response = await fetch(`${this.baseUrl}/api/v2/query?${params.toString()}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: query,
    });
    const json: QueryResponse<T> = await response.json();

    if (json.error) {
      throw Error(json.error);
    }

    if (json.result) {
      enforceHashIdPrimaryKey(json.result);
    }
    return json.result;
  }; // tslint:disable-line:semicolon
}
