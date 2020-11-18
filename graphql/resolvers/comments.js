const { AuthenticationError, UserInputError } = require('apollo-server');

const Post = require('../../models/Post');
const checkAuth = require('../../utils/checkAuth');

module.exports = {
    Mutation: {
        createComment: async (_, { postId, body }, context) => {
            const { username } = checkAuth(context);
            if(body.trim() === '') {
                throw new UserInputError('Empty Comment', {
                    // Attached payload of errors - can be used on client side
                    errors: {
                        body: 'Comment body must not be empty'
                    }
                })
            }

            const post = await Post.findById(postId);

            if(post) {
                post.comments.unshift({
                    body,
                    username,
                    createdAt: new Date().toISOString()
                })
                await post.save();
                return post;
            } else {
                throw new UserInputError('Post not found');
            }
        },

        deleteComment: async (_, { postId, commentId }, context) => {
            // Authenticate user
            const { username } = checkAuth(context);

            // Get the post that matches the id that was passed in as an argument
            const post = await Post.findById(postId);

            if(post) {
                // Get the index of the comment, where the id matches with the one that was passed in.
                const commentIndex = post.comments.findIndex(c => c.id === commentId);

                // If the username of the comment matches with the authenticated user, delete the comment
                // with splice(), where you get rid of one index (requested comment) from the array.
                if(post.comments[commentIndex].username === username) {
                    post.comments.splice(commentIndex, 1);
                    await post.save();
                    return post;
                } else {
                    throw new AuthenticationError('Action not allowed');
                }
            } else {
                throw new UserInputError('Post not found');
            }
        }
    }
}