if (process.env.NODE_ENV == "production") {
  module.exports = {
    mongoURI:
      "mongodb+srv://root:toor123@blogapp-prod.yzgmgty.mongodb.net/?retryWrites=true&w=majority",
  };
} else {
  module.exports = { mongoURI: "mongodb://localhost/blogapp" };
}
