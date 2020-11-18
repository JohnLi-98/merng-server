// Dependancy imports
const { ApolloServer, PubSub } = require('apollo-server');
// mongoose object relational mapper, which lets you interface with the mongoDB database.
const mongoose = require('mongoose');

// Relative imports
const typeDefs = require('./graphql/typeDefs');
// For each query or mutation or subscription, there is a corresponding resolver. Each resolver 
// processes logic and returns what the query returns.
const resolvers = require('./graphql/resolvers');
const { MONGODB } = require('./config.js');

// Instantiate and pass to context, so it can be used in the resolvers
const pubsub = new PubSub();

const PORT = process.env.port || 5000;

// set up Apollo server, context takes a callback, which gets anything that was passed before the 
// apollo server. You get the request and response from express. Destructure the request and forward 
// it to the context, where you can access the request body.
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub })
});

// connect to MongoDB database and pass useNewUrlParser and useUnifiedTopology to stop deprecation 
// warning, which returns a promise where you start the server, specifying a port that returns a 
// promise with a result object.
mongoose
    .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        return server.listen({ port: PORT });
    })
    .then(res => {
        console.log(`Server running at ${res.url}`)
    })
    .catch(err => {
        console.log(err);
    })

