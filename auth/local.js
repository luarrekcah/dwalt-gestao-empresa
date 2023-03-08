const bcrypt = require("bcryptjs"),
  localStrategy = require("passport-local").Strategy;
const { getDatabase, ref, onValue } = require("@firebase/database");
const { createLogs, getItems } = require("../database/users");

const moment = require("../services/moment");
const { sendNotification } = require("../services/nodemailer");

module.exports = async (passport) => {
  const db = getDatabase();

  const usersRef = ref(db, "gestaoempresa/business");
  onValue(usersRef, (snapshot) => {
    let users = [];
    snapshot.forEach((childSnapshot) => {
      let key = childSnapshot.key,
        data = childSnapshot.val();
      users.push({ key, data });
    });

    console.log(`[LOG] Usuários atualizados em tempo real: ${users.length}`);

    const findUser = (email) => {
      return users.find((item) => item.data.info.email === email);
    };

    const findUserById = (id) => {
      return users.find((item) => item.key === id);
    };

    passport.serializeUser((user, done) => {
      done(null, user.key);
    });

    passport.deserializeUser((id, done) => {
      try {
        const user = findUserById(id);
        done(null, user);
      } catch (err) {
        console.log(err);
        return done(err, null);
      }
    });

    passport.use(
      new localStrategy(
        { usernameField: "email", passwordField: "password" },
        async (email, password, done) => {
          if (users === null) return done(null, false);
          try {
            const user = findUser(email);
            if (!user) return done(null, false);
            const isValid = bcrypt.compareSync(
              password,
              user.data.info.password
            );
            if (!isValid) return done(null, false);
            createLogs(user.key, "Login realizado");
            const loginLimit = await getItems({
              path: `gestaoempresa/business/${user.key}/config/login`,
            });
            console.log(loginLimit);
            if (
              loginLimit !== [] &&
              loginLimit.hourSpecified &&
              loginLimit.hourSpecified[0] !== ""
            ) {
              const nowHours = moment().format("LT").split(":")[0];
              const nowMins = moment().format("LT").split(":")[1];
              if (
                Number(nowHours) >=
                  Number(loginLimit.hourSpecified[0].split(":")[0]) &&
                Number(nowHours) <=
                  Number(loginLimit.hourSpecified[1].split(":")[0]) &&
                Number(nowMins) >=
                  Number(loginLimit.hourSpecified[0].split(":")[1]) &&
                Number(nowMins) <=
                  Number(loginLimit.hourSpecified[1].split(":")[1])
              ) {
                console.log("LOGIN EM HORARIO PERMITIDO");
                return done(null, user);
              } else {
                console.log("LOGIN FORA DE HORARIO PERMITIDO");
                if (loginLimit.loginAlert) {
                  sendNotification([user.data.info.email], {
                    title: "Tentativa de login",
                    message:
                      "Detectamos um login em horário incomum.",
                  });
                }
                return done(null, false);
              }
            } else {
              console.log("HORARIO DE LOGIN NAO DEFINIDO");
              return done(null, user);
            }
          } catch (err) {
            console.log(err);
            return done(err, false);
          }
        }
      )
    );
  });
};
