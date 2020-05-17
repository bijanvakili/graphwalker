import * as path from "path";
import express from "express";
import bodyParser from "body-parser";
import { ApolloServer } from "apollo-server-express";
import apolloServerPluginResponseCache from "apollo-server-plugin-response-cache";
import { CayleyDBClient } from "./model/graphdb";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";

const app = express();
const webPort = 9080;

app.use(bodyParser.json());

// ignoring req/res objects in ExpressContext
export interface AppContext {
  dbClient: CayleyDBClient;
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  formatError: (error) => {
    return error;
  },
  context: ({ req, res }) => {
    return {
      req,
      res,
      dbClient: new CayleyDBClient(),
    };
  },
  plugins: [apolloServerPluginResponseCache()],
});

server.applyMiddleware({ app, path: "/graphql" });
app.use("/", express.static(path.resolve(__dirname, "..", "assets")));

app.listen(webPort, () => {
  // tslint:disable-next-line:no-console
  console.log(`app is listening to port ${webPort} from ${__dirname}`);
});
