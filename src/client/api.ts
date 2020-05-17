import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { ApolloClient, gql } from "apollo-boost";
import { DocumentNode } from "graphql";

import {
  RenderSettings,
  Neighborhood,
  QueryNeighborhoodArgs,
  QueryVertexMatchArgs,
  Query as QueryResult,
  Vertex,
} from "./graphwalker/models/Graphwalker";

const gqlClient = new ApolloClient({
  name: "graphwalker-frontend",
  cache: new InMemoryCache(),
  link: createHttpLink({ uri: "/graphql" }),
});

const QUERY_CLIENT_SETTINGS = gql`
  {
    settings {
      startVertexId
      vertexColumnPageSize
      images {
        name
        filename
        height
        width
      }
    }
  }
`;

const QUERY_NEIGHBORHOOD = gql`
  fragment VertexParts on Vertex {
    id
    fullyQualifiedModelName
    modelName
  }

  fragment AdjacentVertexParts on AdjacentVertex {
    other {
      ...VertexParts
    }
    edge {
      id
      label
      fieldType
      fieldName
      multiplicity
    }
  }

  query($id: String!) {
    neighborhood(id: $id) {
      id
      vertex {
        ...VertexParts
      }
      incoming {
        ...AdjacentVertexParts
      }
      outgoing {
        ...AdjacentVertexParts
      }
    }
  }
`;

const MIN_TEXTQUERY_LENGTH = 2;
const QUERY_VERTEX_MATCH = gql`
  query($textQuery: String!) {
    vertexMatch(textQuery: $textQuery) {
      id
      fullyQualifiedModelName
    }
  }
`;

async function queryGraphQL<TQueryArgs>(
  query: DocumentNode,
  variables: TQueryArgs,
  errorPrefix?: string
): Promise<QueryResult> {
  const prefix = errorPrefix ? `${errorPrefix}: ` : "";

  try {
    const response = await gqlClient.query({ query, variables });
    return response.data;
  } catch (error) {
    throw new Error(`${prefix}${error}`);
  }
}

export async function getSettings(): Promise<RenderSettings> {
  const response = await queryGraphQL<{}>(QUERY_CLIENT_SETTINGS, {}, "Settings file");
  return response.settings;
}

export async function getVertexNeighborhood(id: string): Promise<Neighborhood> {
  const response = await queryGraphQL<QueryNeighborhoodArgs>(
    QUERY_NEIGHBORHOOD,
    { id },
    "Vertex neighborhood"
  );
  return response.neighborhood;
}

export async function findMatchingVertices(textQuery: string): Promise<Vertex[]> {
  if (textQuery.length < MIN_TEXTQUERY_LENGTH) {
    return [];
  }

  const response = await queryGraphQL<QueryVertexMatchArgs>(
    QUERY_VERTEX_MATCH,
    { textQuery },
    "Vertex match"
  );
  return response.vertexMatch;
}
