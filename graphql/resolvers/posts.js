const { AuthenticationError, UserInputError } = require('apollo-server');

const Post = require('../../models/Post');
const checkAuth = require('../../utils/checkAuth');

module.exports = {
    Query: {
        // Uses post model to fetch the posts. Add try catch block so if query fails, it doesn't stop the
        // server. Async operation to fetch all posts because there is no condition in find(). sort() gets 
        // the latest posts first.
        async getPosts() {
            try{
                const posts = await Post.find().sort({ createdAt: -1 });
                return posts;
            } catch(err) {
                throw new Error(err);
            }
        },

        // Uses post model to fetch a post with an ID, that matches with the argument that was passed in. 
        // If there is a match, return this post otherwise throw an error.
        async getPost(_, { postId }) {
            try{
                const post = await Post.findById(postId);
                if(post) {
                    return post;
                } else {
                    throw new Error('Post not found');
                }
            } catch(err) {
                throw new Error(err);
            }
        }
    },

    Mutation: {
        // context has the request body and can access the headers and determine whether a user is authenticated. 
        async createPost(_, { body }, context) {
            const user = checkAuth(context);

            if (body.trim() === '') {
                throw new Error('Post body must not be empty');
            }

            // If the following code runs, there was no errors with authorising a user
            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            });

            // save the post
            const post = await newPost.save();

            // Used for subscription function. Publishes the new post to the trigger name 'NEW_POST', so 
            // subscribers of this are notified.
            context.pubsub.publish('NEW_POST', {
                newPost: post
            });

            return post;
        },

        // similar to createPost() but only allow users to delete posts they have created.
        async deletePost(_, { postId }, context) {
            const user = checkAuth(context);

            try {
                // find the post that matches the argument id.
                const post = await Post.findById(postId);
                // if the username matches with the post's username, delete the post. Otherwise,
                // throw an authentication error. 
                if(user.username === post.username) {
                    await post.delete();
                    return 'Post deleted successfully';
                } else {
                    throw new AuthenticationError('Action not allowed');
                }
            } catch(err) {
                throw new Error(err);
            }
            
        },

        likePost: async (_, { postId }, context) => {
            const { username } = checkAuth(context);
    
            const post = await Post.findById(postId);
            if(post) {
                if(post.likes.find(like => like.username === username)) {
                    // Post already liked, unlike post
                    // Uses filter to get rid of the like from the array where a like has username that
                    // matches with authenricated user.
                    post.likes = post.likes.filter(like => like.username !== username);
                } else {
                    // Not liked, like post
                    post.likes.push({
                    username,
                    createdAt: new Date().toISOString()
                    });
                }
                await post.save();
                return post;
            } else {
                throw new UserInputError('Post not found');
            }
            
        }
    },

    // Not implemented on the front end. This is for when a new post is posted, but if the app is quite large, this would
    // not be implemented, as it would be too much traffic and bandwidth. Usually used for polling and chat apps.
    // Uses web sockets in the background to actively listen to the NEW_POST event, and each time a post is published, the
    // client is informed.
    Subscription: {
        // No parent or arguments. For received event types, it is conventional to use all caps.
        newPost: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
        }
    }
};