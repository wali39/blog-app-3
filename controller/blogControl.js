const Blog = require("../models/blog");
const User = require("../models/user");
const Comment = require("../models/comment");

const showBlogs = (req, res, next) => {
  const user = res.locals.user;
  if (user && user.admin === true) {
    var admin = true;
  }

  const perPage = 6;
  const page = req.params.page || 1;

  Blog.find()
    .sort([["updatedAt", -1]])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function (err, blogs) {
      Blog.count().exec(function (err, count) {
        if (err) next(err);
        res.render("index", {
          title: "all blogs",
          admin,
          blogs,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });

  // .then((result) => {
  //   // console.log(result);
  //   res.render("index", { title: "addblogs", admin, blogs: result });
  //   // console.log(result);
  // })
  // .catch((err) => {
  //   console.log(err);
  // });
};

const blogSave = (req, res) => {
  const blog = new Blog(req.body);
  blog.author = req.body.author.trim(" ");
  blog
    .save()
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};
const detailsBlog = async (req, res) => {
  const user = res.locals.user;
  if (user && user.admin === true) {
    var admin = true;
  }

  const blogAndComment = await Blog.findOne({ _id: req.params.id }).populate(
    "comments"
  );
  const id = req.params.id;
  Blog.findById(id).then((result) => {
    res.render("details", {
      blog: result,
      commentArray: blogAndComment,
      title: "single post",
      admin: admin,
    });
  });
};
const deleteBlog = async (req, res) => {
  const id = req.params.id;
  await Blog.findByIdAndRemove(id);
  res.redirect("/");
};
const createBlog = (req, res) => {
  const user = res.locals.user;
  if (user && user.admin === true) {
    var admin = true;
  }
  res.render("create-blog", {
    title: "create-blogs",
    admin: admin,
  });
};
const createComment = async (req, res) => {
  //Find a POst
  const blog = await Blog.findOne({ _id: req.params.id });
  //Create a Comment
  const comment = new Comment();
  const user = res.locals.user;
  comment.content = req.body.content;
  if (user) {
    comment.commentCreator = user.name;
  } else {
    comment.commentCreator = "Anonymous";
  }

  comment.blog = blog._id;
  await comment.save();

  // Associate Post with comment

  blog.comments.push(comment._id);
  await blog.save();
  res.redirect(`/details/${blog.id}`);
};

const editBlog = async function (req, res) {
  const user = res.locals.user;
  var admin = false;
  if (user && user.admin === true) {
    admin = true;
  }
  const id = req.params.id;
  // var user = await User.findOne({_id: id })
  //   .then((result) => {
  //     return result;
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  // console.log(user);
  // if (user1 && user.name === user1.name) {
  //   admin = true;
  // }
  await Blog.findById(id, (err, result) => {
    res.render("edit", { title: "edit post", admin, blog: result });
  });
};

const editedBlogSave = (req, res) => {
  // const blog= req.body;
  const blog = {};
  blog.title = req.body.title.trim(" ");
  blog.author = req.body.author.trim(" ");
  blog.content = req.body.content.trim(" ");

  Blog.findByIdAndUpdate(req.params.id, blog)
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};
module.exports = {
  showBlogs,
  blogSave,
  detailsBlog,
  deleteBlog,
  createBlog,
  createComment,
  editBlog,
  editedBlogSave,
};
