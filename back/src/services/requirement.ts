import { Database } from "arangojs";
import { Transaction } from "arangojs/transaction";
import { Express } from "express";
import { User } from "randevu-shared/dist/types";
import { COLLECTION_OPERATOR, COLLECTION_REQUIREMENT, COLLECTION_USER, EDGE_COLLECTION_OWNS, EDGE_COLLECTION_REGISTERS, EDGE_COLLECTION_REQUESTS, EDGE_COLLECTION_REQUIRES } from "../constants";
import { validateString, validateStringList } from "../utils";
import { findUserByName } from "./user";

export function serviceRequirement(app: Express, db: Database) {
  app.get("/requirements", async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    // TODO
  });

  app.post("/requirements/:docId", (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    // TODO
  });

  app.post("/requirements", async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    const { operator, title, description, reviewers: reviewerList } = req.body;
    if (!validateString(operator) || !validateString(title) || !validateString(description)
        || !reviewerList || !validateStringList(reviewerList)) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionOperator = db.collection(COLLECTION_OPERATOR);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      const collectionRegisters = db.collection(EDGE_COLLECTION_REGISTERS);
      const collectionRequests = db.collection(EDGE_COLLECTION_REQUESTS);
      const collectionRequirement = db.collection(COLLECTION_REQUIREMENT);
      const collectionRequires = db.collection(EDGE_COLLECTION_REQUIRES);
      const collectionUser = db.collection(COLLECTION_USER);
      trx = await db.beginTransaction({
        read: [collectionOperator, collectionOwns, collectionUser],
        write: [collectionRegisters, collectionRequests, collectionRequirement, collectionRequires],
      });
      // Requirement
      const requirement = await trx.step(() => collectionRequirement.save({
        title, description,
      }));
      // Operator
      const operatorFound = await trx.step(() => collectionOperator.document(operator));
      if (!operatorFound) {
        await trx.abort();
        return res.status(400).json({ reason: 'Operator not found' });
      }
      // Check user is owner of operator
      const { username } = user;
      const cursorOwnerFound = await trx.step(() => db.query({
        query: `
          FOR user IN INBOUND @operatorId @@collectionOwns
            FILTER user.username === @username
            LIMIT 1
            RETURN user
        `,
        bindVars: {
          operatorId: operatorFound._id,
          '@collectionOnws': collectionOwns.name,
          username,
        },
      }));
      const ownerFound = await cursorOwnerFound.all();
      if (!ownerFound.length) {
        await trx.abort();
        return res.status(403).json({ reason: 'You are not the owner of the operator' });
      }
      const owner = ownerFound[0];
      // Registers
      await trx.step(() => collectionRegisters.save({
        _from: owner._id,
        _to: requirement._id,
      }));
      // Requires
      await trx.step(() => collectionRequires.save({
        _from: operatorFound._id,
        _to: requirement._id,
      }));
      // Requests to reviewers
      for (let i = 0; i < reviewerList.lenght; i += 1) {
        const reviewer = reviewerList[i];
        const reviewerExists = await trx.step(() => collectionUser.documentExists(reviewer));
        if (!reviewerExists) {
          await trx.abort();
          return res.status(400).json({ reason: 'Reviewer not found' });
        }
        await trx.step(() => collectionRequests.save({
          _from: requirement._id,
          _to: reviewer,
        }));
      }
      await trx.commit();
      return res.status(200).end();
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      return res.status(500).end();
    }
  });
}
