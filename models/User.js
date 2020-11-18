// Holds details about the schema. Although mongoDB is schema-less, specifying a schema will give more safety when working with server code
const { model, Schema } = require('mongoose');

// Could specify a required type but can use GraphQL itself to say that the fields are required.
const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String
});

module.exports = model('User', userSchema);