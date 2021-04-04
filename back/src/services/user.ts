import { Database } from 'arangojs';
import { Transaction } from 'arangojs/transaction';
import { pbkdf2Sync } from 'crypto';
import { Express } from 'express';
import session from 'express-session';
import passport from 'passport';
import passportLocal from 'passport-local';
import { COLLECTION_USER } from '../constants';
import { User } from 'randevu-shared/dist/types';

const SECRET = 'RANdevU aims to make RAN development easy';

export function serviceUser(app: Express, db: Database) {
  app.use(session({
    secret: 'randevu',
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    const _id = (user as User)._id;
    done(null, _id);
  });

  passport.deserializeUser(async (_id: string, done) => {
    const collectionUser = db.collection(COLLECTION_USER);
    let trx: Transaction | undefined;
    try {
      trx = await db.beginTransaction({
        read: collectionUser,
      });
      const user = await trx.step(() => collectionUser.document(_id));
      if (user) {
        delete user.password;
      }
      await trx.commit();
      done(null, user);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      done(e);
    }
  });

  passport.use(new passportLocal.Strategy(
    async function (username, password, done) {
      if (typeof username !== 'string' || !username
          || typeof password !== 'string' || !password
      ) {
        return done(null, false);
      }
      const collectionUser = db.collection(COLLECTION_USER);
      let trx: Transaction | undefined;
      try {
        trx = await db.beginTransaction({
          read: collectionUser,
        });
        const cursorUserFound = await trx.step(() => db.query({
          query: `
            FOR user IN @@collectionUser
              FILTER user.username == @username
                 AND user.password == @password
               LIMIT 1
              RETURN { _id: user._id, username: user.username, role: user.role }
          `,
          bindVars: { '@collectionUser': collectionUser.name, username, password: hash(password) },
        }));
        const userFound = await cursorUserFound.all();
        if (!userFound.length) {
          await trx.abort();
          return done(null, false);
        }
        await trx.commit();
        return done(null, userFound[0]);
      } catch (e) {
        if (trx) {
          await trx.abort();
        }
        console.error(e);
        return done(e);
      }
    }
  ));

  app.get('/authenticate', (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(401).end();
    }
    return res.status(200).json(user);
  });

  app.post('/join', async (req, res) => {
    const { user } = req;
    if (user) {
      return res.status(400).end();
    }
    const { username, password } = req.body;
    if (typeof username !== 'string' || !username
        || typeof password !== 'string' || !password) {
      return res.status(400).end();
    }
    const collectionUser = db.collection(COLLECTION_USER);
    let trx: Transaction | undefined;
    try {
      trx = await db.beginTransaction({
        write: collectionUser,
      });
      const existingUser = await findUserByName(db, trx, username);
      if (existingUser) {
        await trx.abort();
        return res.status(400).json({ reason: 'Duplicate user name' });
      }
      await trx.step(() => collectionUser.save({ username, password: hash(password) }));
      await trx.commit();
      return res.status(200).end();
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user: User, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).end();
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.get('/logout', (req, res) => {
    req.logout();
    return res.status(200).end();
  });

  app.get('/users', async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionUser = db.collection(COLLECTION_USER);
      trx = await db.beginTransaction({
        read: collectionUser,
      });
      const cursorUserList = await trx.step(() => db.query({
        query: `
          FOR user in @@collectionUser
            RETURN { _id: user._id, username: user.username, role: user.role }
        `,
        bindVars: { '@collectionUser': collectionUser.name },
      }));
      const userList = await cursorUserList.all();
      await trx.commit();
      return res.json(userList);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.get('/users/docId/:docId', async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    const { docId } = req.params;
    let trx: Transaction | undefined;
    try {
      const collectionUser = db.collection(COLLECTION_USER);
      trx = await db.beginTransaction({
        read: collectionUser,
      });
      const user = await trx.step(() => collectionUser.document(docId));
      if (!user) {
        await trx.abort();
        return res.status(404).end();
      }
      delete user.password;
      await trx.commit();
      return res.json(user);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.get('/users/username/:username', async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    const { username } = req.params;
    let trx: Transaction | undefined;
    try {
      const collectionUser = db.collection(COLLECTION_USER);
      trx = await db.beginTransaction({
        read: collectionUser,
      });
      const user = await findUserByName(db, trx, username);
      if (!user) {
        await trx.abort();
        return res.status(404).end();
      }
      await trx.commit();
      return res.json(user);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });
}

export async function findUserByName(db: Database, trx: Transaction, username: string) {
  const cursorUserFound = await trx.step(() => db.query({
    query: `
      FOR user IN @@collectionUser
        FILTER user.username == @username
        LIMIT 1
        RETURN { _id: user._id, username: user.username, role: user.role }
    `,
    bindVars: { '@collectionUser': COLLECTION_USER, username },
  }));
  const userFound = await cursorUserFound.all() as User[];
  return userFound[0];
}

function hash(password: string) {
  return pbkdf2Sync(password, SECRET, 1000, 64, 'sha512').toString('hex');
}
