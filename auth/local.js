const bcrypt = require("bcryptjs"),
  localStrategy = require("passport-local").Strategy;
const { getDatabase, ref, onValue } = require("@firebase/database");
const { createLogs } = require("../database/users");

module.exports = async (passport) => {
  const db = getDatabase();

  const usersRef = ref(db, 'gestaoempresa/business');
  onValue(usersRef, (snapshot) => {

    let users = [];
    snapshot.forEach(childSnapshot => {
        let key = childSnapshot.key,
            data = childSnapshot.val();
        users.push({ key, data })
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
        (email, password, done) => {
          if (users === null) return done(null, false);
          try {
            const user = findUser(email);
            if (!user) return done(null, false);
            const isValid = bcrypt.compareSync(password, user.data.info.password);
            if (!isValid) return done(null, false);
            createLogs(user.key, "Login realizado");
            return done(null, user);
          } catch (err) {
            console.log(err);
            return done(err, false);
          }
        }
      )
    );
  });
};