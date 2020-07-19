import { readFile } from "fs";
import { env } from "process";
import { promisify } from "util";
import { GraphQLResolveInfo } from "graphql";

import { ResourceNotFoundError } from "./errors";
import {
  Edge,
  Vertex,
  RenderSettings,
  QueryVertexMatchArgs,
  QueryNeighborhoodArgs,
} from "./graphwalker/types";
import { getVertexByHashId, searchVertices, findNeighborVertices, findNeighborEdges } from "./model/queries";
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

    neighborhood: async (
      _: void,
      queryRequest: QueryNeighborhoodArgs,
      context: AppContext
    ): Promise<Vertex> => {
      // return a single vertex as the parent result to ensure it exists
      // for subqueries
      const query = getVertexByHashId(queryRequest.id);

      const results = await context.dbClient.queryGizmo<Vertex>(query);
      if (!results) {
        throw new ResourceNotFoundError(`Vertex not found: ${queryRequest.id}`);
      }
      return results[0];
    },

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
    id: (parent: QueryNeighborhoodArgs, _: void, context: AppContext): string => {
      return parent.id;
    },

    vertices: async (parent: QueryNeighborhoodArgs, _: void, context: AppContext): Promise<Vertex[]> => {
      const query = findNeighborVertices(parent.id);

      return (await context.dbClient.queryGizmo<Vertex>(query)) || [];
    },

    edges: async (parent: QueryNeighborhoodArgs, _: void, context: AppContext): Promise<Edge[]> => {
      const query = findNeighborEdges(parent.id);

      return (await context.dbClient.queryGizmo<Edge>(query)) || [];
    },
  },
};
