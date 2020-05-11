import { readFileSync } from "fs";
import * as path from "path";

import { gql } from "apollo-server-express";

const typeDefs = gql`
  ${readFileSync(path.join(__dirname, "./graphwalker.graphql")).toString()}
`;
export default typeDefs;
