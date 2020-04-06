import { readFile } from "fs";
import { env } from "process";
import { promisify } from "util";

import {
  Vertex,
  AdjacentVertex,
  RenderSettings,
  QueryVertexMatchArgs,
  QueryNeighborhoodArgs,
} from "./graphwalker/types";
import { getVertexByHashId, searchVertices, findNeighbors, IncidentEdgeDirection } from "./model/queries";
import { AppContext } from "./app";

const readFileAsync = promisify(readFile);

export default {
  Query: {
    vertexMatch: async (
      _: void,
      queryRequest: QueryVertexMatchArgs,
      context: AppContext
    ): Promise<Vertex[]> => {
      const query = searchVertices(queryRequest.textQuery);

      return (await context.dbClient.queryGizmo<Vertex>(query)) || [];
    },

    neighborhood: (_: void, queryRequest: QueryNeighborhoodArgs): QueryNeighborhoodArgs => queryRequest,

    settings: async (): Promise<RenderSettings> => {
      // TODO add caching for read-only settings
      const settingsFilename = env.GRAPHWALKER_RENDER_SETTINGS;
      if (!settingsFilename) {
        throw new Error("GRAPHWALKER_RENDER_SETTINGS not specified");
      }
      const buf = await readFileAsync(settingsFilename);
      return JSON.parse(buf.toString());
    },
  },
  Neighborhood: {
    vertex: async (
      parent: QueryNeighborhoodArgs,
      _: void,
      context: AppContext
    ): Promise<Vertex | undefined> => {
      const query = getVertexByHashId(parent.id);

      const results = await context.dbClient.queryGizmo<Vertex>(query);

      // TODO throw an exception if not found
      if (results) {
        return results[0];
      }
    },

    incoming: async (
      parent: QueryNeighborhoodArgs,
      _: void,
      context: AppContext
    ): Promise<AdjacentVertex[]> => {
      const query = findNeighbors(parent.id, IncidentEdgeDirection.Incoming);

      return (await context.dbClient.queryGizmo<AdjacentVertex>(query)) || [];
    },

    outgoing: async (
      parent: QueryNeighborhoodArgs,
      _: void,
      context: AppContext
    ): Promise<AdjacentVertex[]> => {
      const query = findNeighbors(parent.id, IncidentEdgeDirection.Outgoing);

      return (await context.dbClient.queryGizmo<AdjacentVertex>(query)) || [];
    },
  },
};
