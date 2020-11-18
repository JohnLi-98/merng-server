const { AuthenticationError } = require('apollo-server');

const jwt = require('jsonwebtoken'); // Used to decode web token we receive
const { SECRET_KEY } = require('../config'); // Needed to verify tokens, as it was used to encode 

// function that takes the context and does the following...
module.exports = (context) => {
    // context = { ... headers } context will have an object with many things but need the headers for authorisation
    const authHeader = context.req.headers.authorization;
    if(authHeader) {
        // If authHeader, retrieve the token from it
        // Send header with a value Bearer <token_here>
        // Token is in the second index of the split().
        const token = authHeader.split('Bearer ')[1];
        if(token) {
            // if there is a token, use jsonwebtoken to verify that the token matches with the secret key
            try {
                const user = jwt.verify(token, SECRET_KEY);
                return user;
            } catch(err) {
                throw new AuthenticationError('Invalid/Expired token');
            }
        }
        throw new Error('Authentication token must be \'Bearer [token]');
    }
    throw new Error('Authorisation header must be provided');
};