const { model, Schema } = require('mongoose');

// Can specify a default value but will do that on GraphQL resolvers.
const postSchema = new Schema({
    body: String,
    username: String,
    createdAt: String,
    comments: [
        {
            body: String,
            username: String,
            createdAt: String
        }
    ],
    likes: [
        {
            username: String,
            createdAt: String
        }
    ],
    // Although mongoDB is schema-less and no SQL, it still allows you to have relations
    // between data models. Therefore, you can link the post with a specfic user
    user: {
        // refers to another schema object and passes the table/collection 'users'. Mongoose 
        // will automatically populate the user field.
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

module.exports = model('Post', postSchema);