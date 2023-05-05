const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {

    },
    Mutation: {
        login: async (parent, { email, password }) => {
            try {
                const user = await findOne({ email });
                if (!user) {
                    throw new AuthenticationError('incorrect information');
                }

                const queryPassword = await user.isCorrectPassword(password)

                if (!queryPassword) {
                    throw new AuthenticationError('incorrect information')
                }

                const token = signToken(user)
            } catch (err) {
                console.log(`sign in error: ${err}`)
                throw new AuthenticationError(err)
            }
        },
        addUser: async (parent, args) => {
            try {
                const user = await User.create(args);
                const token = signToken(user);
                return { token, user }
            } catch (err) {
                console.log(`error creating user: ${err}`);
                throw new AuthenticationError(err)
            }
        },
        saveBook: async (parent, args, context) => {
            try {
                if (context.user) {
                    const updateUser = await User.findOneAndUpdate(
                        { _id: context.user._id },
                        { $addToSet: { savedBooks: args.bookId } },
                        { new: true }
                    )
                    return updateUser
                }

                console.log(`no user`)
            } catch (err) {
                console.log(`error adding new book: ${err}`)
            }
        },
        removeBook: async (parent, args,context) => {
            try {
                if (context.user) {
                    const updateUser = await User.findByIdAndUpdate(
                        { _id: context.user._id },
                        { $pull: { savedBooks: args.bookId } },
                        { new: true }
                    )
                    return updateUser
                }

                console.log(`no user`)
            } catch (err) {
                console.log(`error removing book`)
            }
        }
    }
}

module.exports = resolvers