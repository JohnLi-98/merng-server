const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');

module.exports = {
    // Each time any queries, mutations or subscription that returns a post, it will go through the post
    // modifier and apply the modifications for the counters.
    Post: {
        likeCount: (parent) => {
            return parent.likes.length;
        },
        commentCount: (parent) => parent.comments.length
    },
    Query: {
        ...postsResolvers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentsResolvers.Mutation
    },
    Subscription: {
        ...postsResolvers.Subscription
    }
}