// Carregando modulos
const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("Categoria");
const usuarios = require("./routes/usuario");
const passport = require("passport");
require("./config/auth")(passport);
const db = require("./config/db");

// Configurações

//Sessão
app.use(
  session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true,
  })
);

// Middleware da autenticação e sessão do usuário
// middleware que inicializa o passport
app.use(passport.initialize());
// o suporte de sessão é adicionado usando express-session abaixo
app.use(passport.session());
app.use(flash());

//Midlleware
app.use((req, res, next) => {
  // aqui a gente define variaveis globais
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Handlebars
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    // os helpers são 'ajudantes, auxiliares' do handlebars,
    // pois o condicional if dele só consegue verificar true e false de um valor
    helpers: {
      ifId: (v1, v2, options) => {
        v1 = v1._id.toString();
        v2 = v2._id.toString();
        // o fn abaixo fará com que tudo que estiver dentro do ifID seja mostrado,
        // ja o inverse, como o proprio nome diz, não vai mostrar
        return v1 === v2 ? options.fn() : options.inverse();
      },
    },
  })
);

app.set("view engine", "handlebars");

// Mongoose
mongoose.Promise = global.Promise;
mongoose
  .connect(db.mongoURI)
  .then(() => {
    console.log("Conectado ao Mongo com sucesso!");
  })
  .catch((err) => {
    console.log("Erro ao seu conectar com o banco de dados: " + err);
  });

// Public
app.use(express.static(path.join(__dirname, "public")));

//Rotas
app.get("/", (req, res) => {
  Postagem.find()
    .lean()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("index", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno ");
      res.redirect("/404");
    });
});

app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .lean()
    .then((postagem) => {
      if (postagem) {
        res.render("postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Essa postagem não existe");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});

app.get("/404", (req, res) => {
  res.send("Erro 404!");
});

app.get("/categorias", (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias");
      res.flash("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .lean()
    .then((categoria) => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .lean()
          .then((postagens) => {
            res.render("categorias/postagens", {
              postagens: postagens,
              categoria: categoria,
            });
          })
          .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar os posts!");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "Essa categoria não existe");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro interno ao carregar a página dessa categoria"
      );
      res.redirect("/");
    });
});

// Middlewares das rotas
app.use("/admin", admin);
app.use("/usuarios", usuarios);

//Outros
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("Servidor Rodando!");
});
