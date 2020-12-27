import { ApolloServer, gql } from "apollo-server-micro";
import { makeExecutableSchema } from "graphql-tools";
import { MongoClient, ObjectID } from "mongodb";

const typeDefs = gql`
  type User {
    _id: ID!
    firstName: String!
    lastName: String!
    blog: String
    stars: Int
  }

  type Query {
    users: [User]
  }

  type Mutation {
    updateUser(_id: ID!, lastName: String!): User!
  }
`;

const resolvers = {
  Query: {
    async users(parent, args, context, info) {
      const collection = context.db.collection("users");
      return await collection.find({}).toArray();
    }
  },
  Mutation: {
    async updateUser(parent, args, context, info) {
      const collection = context.db.collection("users");
      await collection.updateOne(
        {
          _id: new ObjectID(args._id)
        },
        { $set: { lastName: args.lastName } }
      );
      return collection.findOne({
        _id: new ObjectID(args._id)
      });
    }
  }
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

let db;

const apolloServer = new ApolloServer({
  schema,
  context: async () => {
    if (!db) {
      try {
        const client = new MongoClient(process.env.DATABASE_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        await client.connect();
        db = client.db(process.env.DATABASE_NAME);
      } catch (e) {
        console.log("Error while connecting with graphql context (db)");
        console.log(e);
      }
    }

    return { db };
  }
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default apolloServer.createHandler({ path: "/api/graphql" });
