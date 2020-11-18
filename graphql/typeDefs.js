const { gql } = require('apollo-server');

// Type Definitions with tag template string. Return queries is better to have an exclamtion mark
// for type safety, although it is not required.

// input are given as an input to a resolver for it to return something.
// Instead of putting the input as arguments for register(), a type is created for it instead

// Each post should have a like and comment counter for the client, but you can do it on the server to
// minimise the computation happening on the client. So here we define the two counters as numbers on Post.

// Subscription not implemented on the front end. This is for when a new post is posted, but if the 
// app is quite large, this would not be implemented, as it would be too much traffic and bandwidth. 
// Usually used for polling and chat apps. In this example, it would notify users that are subscribed,
// that a new post had been posted.
module.exports = gql`
    type Post{
        id: ID!
        body: String!
        username: String!
        createdAt: String!
        comments: [Comment]!
        likes: [Like]!
        likeCount: Int!
        commentCount: Int!
    }

    type Comment{
        id: ID!
        createdAt: String!
        username: String!
        body: String!
    }

    type Like{
        id: ID!
        createdAt: String!
        username: String!
    }

    type User{
        id: ID!
        email: String!
        token: String!
        username: String!
        createdAt: String!
    }

    input RegisterInput{
        username: String!
        password: String!
        confirmPassword: String!
        email: String!
    }

    type Query{
        getPosts: [Post]
        getPost(postId: ID!): Post
    }

    type Mutation{
        register(registerInput: RegisterInput): User!
        login(username: String!, password: String!) : User!
        createPost(body: String!): Post!
        deletePost(postId: ID!): String!
        createComment(postId: ID!, body: String!): Post!
        deleteComment(postId: ID!, commentId: ID!): Post!
        likePost(postId: ID!): Post!
    }


    type Subscription{
        newPost: Post!
    }
`;