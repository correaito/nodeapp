const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Model de Usuario
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

module.exports = (passport) => {
  passport.use(
    new localStrategy(
      { usernameField: "email", passwordField: "senha" },
      (email, senha, done) => {
        Usuario.findOne({ email: email }).then((usuario) => {
          if (!usuario) {
            return done(null, false, { message: "Essa conta não existe" });
          }

          bcrypt.compare(senha, usuario.senha, (erro, batem) => {
            if (batem) {
              return done(null, usuario);
            } else {
              return done(null, false, { message: "Senha incorreta" });
            }
          });
        });
      }
    )
  );


  // função para manter os dados do usuário (após a autenticação bem-sucedida) na sessão
  passport.serializeUser((usuario, done) => {
    done(null, usuario.id);
  });

  // essa função é usada para recuperar dados do usuário da sessão.
  passport.deserializeUser((id, done) => {
    Usuario.findById(id, (err, usuario) => {
      done(err, usuario);
    });
  });
};
