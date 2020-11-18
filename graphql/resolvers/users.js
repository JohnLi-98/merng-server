const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userInputError, UserInputError } = require('apollo-server');

const { validateRegisterInput, validateLoginInput } = require('../../utils/validators')
const { SECRET_KEY } = require('../../config');
const User = require('../../models/User');

function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, { expiresIn: '1h' });
}

module.exports = {
    Mutation: {
        async login(_, { username, password }) {
            const { valid, errors } = validateLoginInput(username, password);
            
            if(!valid) {
                throw new UserInputError('Errors', { errors });
            }
            
            const user = await User.findOne({ username });
            
            if(!user) {
                errors.general = 'User not found';
                throw new UserInputError('User not found', { errors });
            }

            const match = await bcrypt.compare(password, user.password);
            if(!match) {
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', { errors });
            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            };
        },

        // Resolver for register. Most of the time would use args but parent gives result of what the input of the last step.
        // Here, parent would be undefined as there is not step before this. Data can be passed from one resolver to multiple 
        // different ones where it is processed differently. As this doesn't need parent as an argument, it is replaced with 
        // an underscore. The args is from the registerInput, which has been destructured. Info is general info about some metadata (not really needed).
        async register(
            _,
            {
                registerInput : { username, email, password, confirmPassword }
            }
            ) {
            // TODO Validate user data
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
            if(!valid) {
                throw new UserInputError('Errors', { errors });
            }

            // TODO Make sure user doesn't already exist
            const user = await User.findOne({ username });
            if(user) {
                throw new UserInputError("Username is taken", {
                    errors: {
                        username: 'This username is taken'
                    }
                });
            }

            // Hash password and create an auth token
            // Hashing password and returning datat to user uses packages bcryptjs and jsonwebtoken. bcryptjs encrypts the password
            // and is an asynchronous operation, while jsonwebtoken will encode some data into a token and return it to the user.
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token
            };
        }
    }
}