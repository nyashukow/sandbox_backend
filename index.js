const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const { graphqlHTTP } = require('express-graphql');
const { 
  GraphQLSchema, 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLList, 
  GraphQLInt, 
  GraphQLInputObjectType, 
  GraphQLNonNull 
} = require('graphql')

mongoose.connect('mongodb://mongo:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

const Recipe = mongoose.model('Recipe', { name: String });

const RecipeType = new GraphQLObjectType({
  name: 'Recipe',
  fields: {
    _id: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    }
  }
})

const RecipeInputType = new GraphQLInputObjectType({
  name: 'RecipeInput',
  fields: {
    _id: {
      type: GraphQLString
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }
})

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      recipe: {
        type: RecipeType,
        args: {
          id: {
            type: GraphQLString
          }
        },
        resolve: async (_, { id }) => {
          return await Recipe.findById(id)
        }
      },
      recipes: {
        type: new GraphQLList(RecipeType),
        args: {
          limit: {
            type: GraphQLInt,
            defaultValue: 0
          }
        },
        resolve: async () => {
          return await Recipe.find()
        }
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addRecipe: {
        type: RecipeType,
        args: {
          recipe: {
            type: RecipeInputType
          }
        },
        resolve: async (_, { recipe }) => {
          const doc = new Recipe(recipe)
          await doc.save()
          return doc
        }
      },
      updateRecipe: {
        type: RecipeType,
        args: {
          recipe: {
            type: RecipeInputType
          }
        },
        resolve: async (_, { recipe }) => {
          const doc = await Recipe.findById(recipe._id)
          doc.set(recipe)
          await doc.save()
          return doc
        }
      },
      deleteRecipe: {
        type: RecipeType,
        args: {
          id: {
            type: GraphQLString
          }
        },
        resolve: async (_, { id }) => {
          const doc = await Recipe.findById(id)
          await doc.remove()
          return doc
        }
      }
    }
  })
})

const app = express()
app.use(cors())
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))
app.listen(3000)