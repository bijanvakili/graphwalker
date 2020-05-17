import { readFile } from "fs";
import { env } from "process";
import { promisify } from "util";
import { GraphQLResolveInfo } from "graphql";

import { ResourceNotFoundError } from "./errors";
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

    settings: async (
      parent: QueryNeighborhoodArgs,
      _request: void,
      context: AppContext,
      info: GraphQLResolveInfo
    ): Promise<RenderSettings> => {
      info.cacheControl.setCacheHint({ maxAge: 3600 });

      const settingsFilename = env.GRAPHWALKER_RENDER_SETTINGS;
      if (!settingsFilename) {
        throw new Error("GRAPHWALKER_RENDER_SETTINGS not specified");
      }
      const buf = await readFileAsync(settingsFilename);
      return JSON.parse(buf.toString());
    },
  },
  Neighborhood: {
    vertex: async (parent: QueryNeighborhoodArgs, _: void, context: AppContext): Promise<Vertex> => {
      const query = getVertexByHashId(parent.id);

      const results = await context.dbClient.queryGizmo<Vertex>(query);
      if (!results) {
        throw new ResourceNotFoundError(`Vertex not found: ${parent.id}`);
      }
      return results[0];
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
