import { Database } from 'arangojs';
import { Transaction } from 'arangojs/transaction';
import { Express } from 'express';
import session from 'express-session';
import passport from 'passport';
import { COLLECTION_USER } from '../constants';

export function serviceUser(app: Express, db: Database) {
  app.use(session({
    secret: 'randevu',
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

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
      const cursorExistingUser = await trx.step(() => db.query({
        query: `
          FOR user IN @@collectionUser
            FILTER user.username == @username
            LIMIT 1
            RETURN true
        `,
        bindVars: { '@collectionUser': COLLECTION_USER, username },
      }));
      const existingUser = await cursorExistingUser.all();
      if (existingUser.length) {
        return res.status(400).json({ reason: 'Duplicate user name' });
      }
      await trx.step(() => collectionUser.save({ username, password }));
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
}
