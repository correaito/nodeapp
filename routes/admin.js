const express = require("express");
const categoria = require("../models/Categoria");
const mongoose = require("mongoose");
const router = express.Router();
require("../models/Postagem");
const Postagem = mongoose.model("postagens");
const {eAdmin} = require("../helpers/eAdmin")

// aqui vamos chamar o arquivo model das categorias
const categorias = require("../models/Categoria");

router.get("/", eAdmin, (req, res) => {
  res.render("./admin/index");
});

router.get("/posts", eAdmin, (req, res) => {
  res.send("Página de Posts");
});

router.get("/categorias", eAdmin, (req, res) => {
  categorias
    .find()
    .sort({ date: "desc" })
    .lean()
    .then((categorias) => {
      res.render("./admin/categorias", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("./admin/addcategorias");
});

router.post("/categoria/nova", eAdmin, (req, res) => {
  var erros = [];

  if (!req.body.nome || req.body.nome <= 0) {
    erros.push({ texto: "Nome Inválido" });
  }
  if (!req.body.slug || req.body.slug <= 0) {
    erros.push({ texto: "Slug Inválido" });
  }

  if (erros.length > 0) {
    res.render("./admin/addcategorias", { erros: erros });
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    };
    new categorias(novaCategoria)
      .save()
      .then(() => {
        req.flash("success_msg", "Categoria criada com sucesso!");
        res.redirect("/admin/categorias");
      })
      .catch((err) => {
        req.flash(
          "error_msg",
          "Houve um erro ao salvar a categoria. Tente novamente!"
        );
        res.redirect("/admin");
      });
  }
});

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  categorias
    .findOne({ _id: req.params.id })
    .lean()
    .then((categoria) => {
      res.render("admin/editcategorias", { categoria: categoria });
    })
    .catch((err) => {
      req.flash("error_msg", "Essa categoria não existe!");
      res.redirect("/admin/categorias");
    });
});

router.post("/categoria/edit", eAdmin, (req, res) => {
  categorias
    .findOne({ _id: req.body.id })
    .then((categoria) => {
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;

      categoria
        .save()
        .then(() => {
          req.flash("success_msg", "Categoria editada com sucesso");
          res.redirect("/admin/categorias");
        })
        .catch((err) => {
          req.flash(
            "error_msg",
            "Houve um erro interno ao salvar a edição da categoria!"
          );
          res.redirect("/admin/categorias");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao editar a categoria");
      res.redirect("admin/categorias");
    });
});

router.get("/categorias/deletar/:id", eAdmin, (req, res) => {
  categorias
    .remove({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "Categoria deletada com sucesso!");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar a categoria!");
      res.redirect("/admin/categorias");
    });
});

// Listagem de Postagens
router.get("/postagens", eAdmin, (req, res) => {
  Postagem.find()
    .lean()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("admin/postagens", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as postagens");
      res.redirect("/admin");
    });
});

// criando um nova postagem, e aqui vamos carregar as categorias
router.get("/postagens/add", eAdmin, (req, res) => {
  categorias
    .find()
    .lean()
    .then((categorias) => {
      res.render("admin/addpostagem", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário");
      res.redirect("/admin");
    });
});

router.post("/postagens/nova", eAdmin, (req, res) => {
  var erros = [];

  if (req.body.categoria == "0") {
    erros.push({ texto: "Categoria inválida, registre uma categoria" });
  }

  if (erros.length > 0) {
    res.render("admin/addpostagem", { erros: erros });
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug,
    };
    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash("success_msg", "Postagem criada com sucesso!");
        res.redirect("/admin/postagens");
      })
      .catch((erro) => {
        req.flash(
          "error_msg",
          "Houve um erro durante o salvamento da postagem"
        );
        res.redirect("/admin/postagens");
      });
  }
});

// Edição de Postagens
router.get("/postagens/edit/:id", eAdmin, (req, res) => {
  // perceba aqui que estamos fazendo buscas em sequencia, primeiro das postagens, depois das categorias
  Postagem.findOne({ _id: req.params.id })
    .populate("categoria")
    .lean()
    .then((postagem) => {
      categoria
        .find()
        .lean()
        .then((categorias) => {
          res.render("admin/editpostagens", {
            categorias: categorias,
            postagem: postagem,
          });
        })
        .catch((err) => {
          req.flash(
            "error_msg",
            "Houve um erro ao listar as postagens: " + err
          );
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro ao carregar o formulário de edição"
      );
      res.redirect("/admin/postagens");
    });
});

router.post("/postagem/edit/", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.body.id })
    .then((postagem) => {
      postagem.titulo = req.body.titulo;
      postagem.slug = req.body.slug;
      postagem.descricao = req.body.descricao;
      postagem.conteudo = req.body.conteudo;
      postagem.categoria = req.body.categoria;

      postagem
        .save()
        .then(() => {
          req.flash("success_msg", "Postagem editada com sucesso!");
          res.redirect("/admin/postagens");
        })
        .catch((err) => {
          req.flash("error_msg", "Erro interno");
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar a edição");
      res.redirect("admin/postagens");
    });
});

router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
  Postagem.remove({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "Postagem deletada com sucesso!");
      res.redirect("/admin/postagens");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/admin/postagens");
    });
});

module.exports = router;
