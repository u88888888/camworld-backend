const { createServer } = require("http");
const express = require("express");
const { execute, subscribe } = require("graphql");
const { ApolloServer } = require("apollo-server-express");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { ApolloServerPluginLandingPageDisabled } = require ("apollo-server-core");
const cors = require('cors');
const uploadRoutes = require('./routes/uploadRoutes');

(async () => {
  const contextMiddleware = require('./utils/contextMiddleware')
  const PORT = process.env.PORT || 5555
  const app = express();
  require('express-ws')(app);
  app.use(cors())
  require('./models/Associations');
  const httpServer = createServer(app);

  const resolvers = require('./graphql/resolver/rootResolver')
  const typeDefs = require('./graphql/schema')


  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    context: contextMiddleware,
    // plugins: [ApolloServerPluginLandingPageDisabled()],
    playground: true,
    introspection: true,
  });

  app.use('/api/upload', uploadRoutes)

  await server.start();
  server.applyMiddleware({ app });

  SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: server.graphqlPath }
  );


  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
    );
  });

})();
