'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _posts = require('./data/posts');

var _posts2 = _interopRequireDefault(_posts);

var _authors = require('./data/authors');

var _authors2 = _interopRequireDefault(_authors);

var _groups = require('./data/groups');

var _groups2 = _interopRequireDefault(_groups);

var _comments = require('./data/comments');

var _comments2 = _interopRequireDefault(_comments);

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handlePaginationArgs = function handlePaginationArgs(_ref, objs) {
  var beforeCursor = _ref.beforeCursor,
      afterCursor = _ref.afterCursor,
      first = _ref.first,
      last = _ref.last;

  var arrayPartial = void 0;
  if (first) {
    var docsToSend = first + 1;
    var startingIdx = objs.findIndex(function (obj) {
      return obj.cursor === afterCursor;
    }) + 1;
    arrayPartial = objs.slice(startingIdx, startingIdx + docsToSend);
  } else if (last) {
    var _docsToSend = last + 1;
    var endingIdx = objs.findIndex(function (obj) {
      return obj.cursor === beforeCursor;
    });
    endingIdx = endingIdx === -1 ? objs.length : endingIdx;
    var start = Math.max(0, endingIdx - _docsToSend);
    arrayPartial = objs.slice(start, endingIdx);
  } else {
    arrayPartial = objs;
  }
  return arrayPartial;
};

var CategoryType = new _graphql.GraphQLEnumType({
  name: "CategoryType",
  description: "A CategoryType of the blog",
  values: {
    HOT_STUFF: { value: "hot stuff" },
    ICE_COLD: { value: "ice cold" }
  }
});

var AuthorType = new _graphql.GraphQLObjectType({
  name: "AuthorType",
  description: "Represent the type of an author of a blog post or a comment",
  fields: function fields() {
    return {
      _id: { type: _graphql.GraphQLString },
      name: { type: _graphql.GraphQLString },
      twitterHandle: { type: _graphql.GraphQLString }
    };
  }
});

var HasAuthorType = new _graphql.GraphQLInterfaceType({
  name: "HasAuthorType",
  description: "This type has an author",
  fields: function fields() {
    return {
      author: { type: AuthorType }
    };
  },
  resolveType: function resolveType(obj) {
    if (obj.title) {
      return PostType;
    } else if (obj.replies) {
      return CommentType;
    }
  }
});

var CommentType = new _graphql.GraphQLObjectType({
  name: "CommentType",
  interfaces: [HasAuthorType],
  description: "Represent the type of a comment",
  fields: function fields() {
    return {
      _id: { type: _graphql.GraphQLString },
      content: { type: _graphql.GraphQLString },
      author: {
        type: AuthorType,
        resolve: function resolve(_ref2) {
          var author = _ref2.author;

          return _authors2.default.find(function (doc) {
            return doc.author === author;
          });
        }
      },
      createdAt: { type: _graphql.GraphQLFloat },
      cursor: { type: _graphql.GraphQLString },
      karma: { type: _graphql.GraphQLInt },
      postId: { type: _graphql.GraphQLString }
    };
  }
});

var GroupType = new _graphql.GraphQLObjectType({
  name: "Group",
  description: "A group with an owner and members",
  args: {
    groupId: { type: _graphql.GraphQLString }
  },
  fields: function fields() {
    return {
      _id: { type: _graphql.GraphQLString },
      owner: {
        type: MemberType,
        resolve: function resolve(source) {
          var author = void 0;
          author = _authors2.default.find(function (doc) {
            return doc._id === source.ownerId;
          });
          if (!author) {
            author = _groups2.default.find(function (doc) {
              return doc._id === source.ownerId;
            });
          }
          return author;
        }
      },
      members: {
        type: new _graphql.GraphQLList(MemberType),
        resolve: function resolve(source) {
          return source.members.map(function (member) {
            var author = void 0;
            author = _authors2.default.find(function (doc) {
              return doc._id === member;
            });
            if (!author) {
              author = _groups2.default.find(function (doc) {
                return doc._id === member;
              });
            }
            return author;
          });
        }
      }
    };
  }
});

var MemberType = new _graphql.GraphQLUnionType({
  name: "Member",
  resolveType: function resolveType(obj) {
    if (obj.hasOwnProperty('ownerId')) {
      return GroupType;
    } else {
      return AuthorType;
    }
  },

  types: [GroupType, AuthorType]
});

var KeywordMentioned = new _graphql.GraphQLObjectType({
  name: 'KeywordMentioned',
  fields: function fields() {
    return {
      word: { type: _graphql.GraphQLString, description: 'a word mentioned in the title' }
    };
  }
});

var PostType = new _graphql.GraphQLObjectType({
  name: "PostType",
  interfaces: [HasAuthorType],
  description: "Represent the type of a blog post",
  fields: function fields() {
    return {
      _id: { type: _graphql.GraphQLString },
      title: {
        type: _graphql.GraphQLString,
        args: {
          language: { type: _graphql.GraphQLString, description: "Language of the title" },
          inReverse: { type: _graphql.GraphQLBoolean, description: 'give the title in reverse' }
        },
        resolve: function resolve(source, args) {
          if (args.language === 'spanish') {
            if (args.inReverse) {
              return source.title_ES.split('').reverse().join('');
            }
            return source.title_ES;
          }
          if (args.inReverse) {
            return source.title.split('').reverse().join('');
          }
          return source.title;
        }
      },
      category: { type: CategoryType },
      content: { type: _graphql.GraphQLString },
      createdAt: {
        type: _graphql.GraphQLInt,
        args: {
          dateOptions: { type: DateOptionsType, description: "example of a subfield with an input obj" }
        },
        resolve: function resolve(source) {
          return source.createdAt;
        }
      },
      comments: {
        type: new _graphql.GraphQLList(CommentType),
        args: {
          beforeCursor: { type: _graphql.GraphQLString, description: 'the cursor coming from the back' },
          afterCursor: { type: _graphql.GraphQLString, description: 'the cursor coming from the front' },
          first: { type: _graphql.GraphQLInt, description: "Limit the comments from the front" },
          last: { type: _graphql.GraphQLInt, description: "Limit the comments from the back" }
        },
        resolve: function resolve(post, args) {
          return handlePaginationArgs(args, _comments2.default);
        }
      },
      author: {
        type: AuthorType,
        resolve: function resolve(_ref3) {
          var author = _ref3.author;

          return _authors2.default.find(function (doc) {
            return doc._id === author;
          });
        }
      },
      keywordsMentioned: {
        type: new _graphql.GraphQLList(KeywordMentioned),
        description: 'a list of objects with a word prop for testing arrays of non-entity objects'
      },
      cursor: { type: _graphql.GraphQLString }
    };
  }
});

var CreatePostMutationPayload = new _graphql.GraphQLObjectType({
  name: "CreatePostMutationPayload",
  description: "Payload for creating a post",
  fields: function fields() {
    return {
      post: { type: PostType },
      postCount: { type: _graphql.GraphQLInt }
    };
  }
});

var RemovePostMutationPayload = new _graphql.GraphQLObjectType({
  name: "RemovePostMutationPayload",
  description: "Payload for removing a post",
  fields: function fields() {
    return {
      removedPostId: { type: _graphql.GraphQLString },
      postCount: { type: _graphql.GraphQLInt }
    };
  }
});

var NewPost = new _graphql.GraphQLInputObjectType({
  name: "NewPost",
  description: "input object for a new post",
  fields: function fields() {
    return {
      _id: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) },
      content: { type: _graphql.GraphQLString },
      title: { type: _graphql.GraphQLString },
      category: { type: _graphql.GraphQLString }
    };
  }
});

var DateOptionsType = new _graphql.GraphQLInputObjectType({
  name: "DateOptions",
  description: "formatting options for the date",
  fields: function fields() {
    return {
      day: { type: _graphql.GraphQLBoolean },
      month: { type: _graphql.GraphQLBoolean },
      year: { type: _graphql.GraphQLBoolean }
    };
  }
});

var NewMember = new _graphql.GraphQLInputObjectType({
  name: "NewMember",
  description: "input object for a new member",
  fields: function fields() {
    return {
      _id: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) },
      name: { type: _graphql.GraphQLString },
      ownerId: { type: _graphql.GraphQLString },
      members: { type: new _graphql.GraphQLList(_graphql.GraphQLString) },
      twitterHandle: { type: _graphql.GraphQLString }
    };
  }
});

var Query = new _graphql.GraphQLObjectType({
  name: 'BlogSchema',
  description: "Root of the Blog Schema",
  fields: function fields() {
    return {
      getPostCount: {
        type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt),
        description: "the number of posts currently in the db",
        resolve: function resolve() {
          return _posts2.default.length;
        }
      },
      getLatestPost: {
        type: PostType,
        description: "Latest post in the blog",
        resolve: function resolve() {
          var sortedPosts = _posts2.default.sort(function (a, b) {
            return b.createdAt - a.createdAt;
          });
          return sortedPosts[0];
        }
      },
      getLatestPostId: {
        type: _graphql.GraphQLString,
        description: "Latest post id in the blog",
        resolve: function resolve() {
          var sortedPosts = _posts2.default.sort(function (a, b) {
            return b.createdAt - a.createdAt;
          });
          return sortedPosts[0]._id;
        }
      },
      getRecentPosts: {
        type: new _graphql.GraphQLList(PostType),
        description: "Recent posts in the blog",
        args: {
          beforeCursor: { type: _graphql.GraphQLString, description: 'the cursor coming from the back' },
          afterCursor: { type: _graphql.GraphQLString, description: 'the cursor coming from the front' },
          first: { type: _graphql.GraphQLInt, description: "Limit the comments from the front" },
          last: { type: _graphql.GraphQLInt, description: "Limit the comments from the back" }
        },
        resolve: function resolve(source, args, ref) {
          var sortedPosts = _posts2.default.sort(function (a, b) {
            return b.createdAt - a.createdAt;
          });

          return handlePaginationArgs(args, sortedPosts);
        }
      },
      getPostById: {
        type: PostType,
        description: "PostType by _id",
        args: {
          _id: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) }
        },
        resolve: function resolve(source, _ref4) {
          var _id = _ref4._id;

          return _posts2.default.find(function (doc) {
            return doc._id === _id;
          });
        }
      },
      getGroup: {
        type: GroupType,
        args: {
          _id: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) }
        },
        resolve: function resolve(source, _ref5) {
          var _id = _ref5._id;

          return _groups2.default.find(function (doc) {
            return doc._id === _id;
          });
        }
      },
      getCommentsByPostId: {
        type: new _graphql.GraphQLList(CommentType),
        description: "Comments for a specific post",
        args: {
          postId: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) }
        },
        resolve: function resolve(source, _ref6) {
          var postId = _ref6.postId;

          return _comments2.default.filter(function (doc) {
            return doc.postId === postId;
          });
        }
      }
    };
  }
});

var Mutation = new _graphql.GraphQLObjectType({
  name: "BlogMutations",
  fields: function fields() {
    return {
      createPost: {
        type: CreatePostMutationPayload,
        description: "Create a post",
        args: {
          newPost: { type: new _graphql.GraphQLNonNull(NewPost) },
          // this is wrong to break out the author, but useful for testing different arg types
          author: { type: _graphql.GraphQLString }
        },
        resolve: function resolve(source, _ref7) {
          var newPost = _ref7.newPost,
              author = _ref7.author;

          var now = Date.now();
          var post = Object.assign({}, newPost, {
            karma: 0,
            createdAt: now,
            title_ES: newPost.title + ' EN ESPANOL!',
            cursor: now + 'chikachikow',
            author: author
          });
          _posts2.default.push(post);
          return {
            post: post,
            postCount: _posts2.default.length
          };
        }
      },
      removePostById: {
        type: RemovePostMutationPayload,
        description: 'Remove a post',
        args: {
          postId: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) }
        },
        resolve: function resolve(source, _ref8) {
          var postId = _ref8.postId;

          var removedPostIdx = _posts2.default.findIndex(function (doc) {
            return doc.postId === postId;
          });
          var didRemove = false;
          if (removedPostIdx !== -1) {
            _posts2.default.splice(removedPostIdx, 1);
            didRemove = true;
          }
          return {
            removedPostId: didRemove ? postId : null,
            postCount: Object.keys(_posts2.default).length
          };
        }
      },
      updatePost: {
        type: PostType,
        description: 'update a post',
        args: {
          post: { type: NewPost }
        },
        resolve: function resolve(source, _ref9) {
          var post = _ref9.post;

          var storedPost = _posts2.default.find(function (doc) {
            return doc._id === post._id;
          });
          if (storedPost) {
            var updatedKeys = Object.keys(post);
            updatedKeys.forEach(function (key) {
              var value = post[key];
              if (value === null) {
                delete storedPost[key];
              } else {
                storedPost[key] = value;
              }
            });
          }
          return storedPost;
        }
      },
      createComment: {
        type: CommentType,
        description: "Comment on a post",
        args: {
          _id: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) },
          postId: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) },
          content: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) }
        },
        resolve: function resolve(source, _ref10) {
          var content = _ref10.content,
              postId = _ref10.postId,
              _id = _ref10._id;

          var newPost = {
            _id: _id,
            content: content,
            postId: postId,
            karma: 0,
            author: 'a125',
            createdAt: Date.now()
          };
          _comments2.default.push(newPost);
          return newPost;
        }
      },
      createMembers: {
        type: new _graphql.GraphQLList(MemberType),
        description: "Create multiple members",
        args: {
          members: { type: new _graphql.GraphQLNonNull(new _graphql.GraphQLList(new _graphql.GraphQLNonNull(NewMember))) }
        },
        resolve: function resolve(source, _ref11) {
          var members = _ref11.members;

          return members;
        }
      }
    };
  }
});

exports.default = new _graphql.GraphQLSchema({
  query: Query,
  mutation: Mutation
});