import { Database } from "arangojs";
import { Transaction } from "arangojs/transaction";
import { Express } from 'express';
import { COLLECTION_OPERATOR, COLLECTION_PACKAGE, COLLECTION_USER, EDGE_COLLECTION_OWNS, EDGE_COLLECTION_SUCCEEDS, EDGE_COLLECTION_TARGETS } from "../constants";
import { User } from "randevu-shared/dist/types";
import { validateString } from "../utils";

export function servicePackage(app: Express, db: Database) {
  app.get('/packages', async (req, res) => {
    const user = req.user as User;
    if(!user) {
      return res.status(403).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionOperator = db.collection(COLLECTION_OPERATOR);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      const collectionPackage = db.collection(COLLECTION_PACKAGE);
      const collectionSucceeds = db.collection(EDGE_COLLECTION_SUCCEEDS);
      const collectionTargets = db.collection(EDGE_COLLECTION_TARGETS);
      const collectionUser = db.collection(COLLECTION_USER);
      trx = await db.beginTransaction({
        read: [collectionPackage, collectionOperator, collectionOwns, collectionTargets, collectionSucceeds, collectionUser],
      });
      const { name, operatorList } = req.query;
      const filterList = [];
      const bindVarsFilter = {} as any;
      if (name) {
        if (typeof name === 'string') {
          filterList.push(`package.name LIKE CONCAT('%', @name, '%')`);
          bindVarsFilter.name = name;
        } else {
          await trx.abort();
          return res.status(400).end();
        }
      }
      if (operatorList) {
        if (operatorList instanceof Array) {
          if (operatorList.length) {
            filterList.push(`POSITION (@operatorList, operator.name)`)
            bindVarsFilter.operatorList = operatorList;
          }
        } else {
          await trx.abort();
          return res.status(400).end();
        }
      }
      const filter = filterList.length ? `FILTER ${filterList.join(' AND ')}` : '';
      const cursorPackageInfoList = await trx.step(() => db.query({
        query: `
          FOR package in @@collectionPackage
            FOR operator IN OUTBOUND package @@collectionTargets
              ${filter}
              FOR owner IN INBOUND package @@collectionOwns
                let previousPackage = (
                  FOR prevPkg IN OUTBOUND package @@collectionSucceeds
                    RETURN prevPkg
                )[0]
                RETURN {
                  _id: package._id
                  name: package.name,
                  operator: {
                    _id: operator._id,
                    name: operator.name
                  }
                  previousPackage: {
                    _id: previousPackage._id,
                    name: previousPackage.name
                  },
                  owner: {
                    _id: owner._id,
                    username: owner.username
                  }
                }
        `,
        bindVars: {
          '@collectionPackage': collectionPackage.name,
          '@collectionTargets': collectionTargets.name,
          '@collectionOwns': collectionOwns.name,
          '@collectionSucceeds': collectionSucceeds.name,
          ...bindVarsFilter,
        },
      }));
      const packageInfoList = await cursorPackageInfoList.all();
      await trx.commit();
      return res.json(packageInfoList);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.post('/packages', async (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== 'admin') {
      return res.status(403).end();
    }
    const { packageName, operatorName, previousPackageName, owner } = req.body;
    if (!validateString(packageName) || !validateString(operatorName) || !validateString(owner)) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionOperator = db.collection(COLLECTION_OPERATOR);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      const collectionPackage = db.collection(COLLECTION_PACKAGE);
      const collectionSucceeds = db.collection(EDGE_COLLECTION_SUCCEEDS);
      const collectionTargets = db.collection(EDGE_COLLECTION_TARGETS);
      const collectionUser = db.collection(COLLECTION_USER);
      trx = await db.beginTransaction({
        read: [collectionOperator, collectionUser],
        write: [collectionPackage, collectionOwns, collectionSucceeds, collectionTargets],
      });
      // Create package document
      const cursorPackageFound = await trx.step(() => db.query({
        query: `
          FOR pacakge IN @@collectionPackage
            FILTER pacakge.packageName == @packageName
            LIMIT 1
            RETURN pacakge._id
        `,
        bindVars: {
          '@collectionPackage': collectionPackage.name, packageName,
        },
      }));
      const packageFound = await cursorPackageFound.all();
      if (packageFound.length) {
        await trx.abort();
        return res.status(400).json({ reason: `Duplicate package name` });
      }
      const pkg = await trx.step(() => collectionPackage.save({ packageName }));
      // User -owns-> package
      const cursorUserDocIdFound = await trx.step(() => db.query({
        query: `
          FOR user in @@collectionUser
            FILTER user.username == @owner
            LIMIT 1
            RETURN user._id
        `,
        bindVars: { '@collectionUser': collectionUser.name, owner },
      }));
      const userDocIdFound = await cursorUserDocIdFound.all();
      if (!userDocIdFound.length) {
        await trx.abort();
        return res.status(400).json({ reason: 'User not found' });
      }
      const userDocId = userDocIdFound[0];
      await trx.step(() => collectionOwns.save({
        _from: userDocId,
        _to: pkg._id,
      }));
      // Package -targets-> operator
      const cursorOperatorIdFound = await trx.step(() => db.query({
        query: `
          FOR operator IN @@collectionOperator
            FILTER operator.operatorName == @operatorName
            LIMIT 1
            RETURN operator._id
        `,
        bindVars: { '@collectionOperator': collectionOperator.name, operatorName },
      }));
      const operatorIdFound = await cursorOperatorIdFound.all();
      if (!operatorIdFound.length) {
        await trx.abort();
        return res.status(400).json({ reason: 'Operator not found' });
      }
      const operatorId = operatorIdFound[0];
      await trx.step(() => collectionTargets.save({
        _from: pkg._id,
        _to: operatorId,
      }));
      // Package -success-> (previous) package
      if (previousPackageName) {
        if (typeof previousPackageName === 'string') {
          const cursorPreviousPkgIdFound = await trx.step(() => db.query({
            query: `
              FOR package IN @@collectionPackage
                FILTER package.packageName == @previousPackageName
                LIMIT 1
                RETURN package._id
            `,
            bindVars: { '@collectionPackage': collectionPackage.name, previousPackageName },
          }));
          const previousPackageIdFound = await cursorPreviousPkgIdFound.all();
          if (!previousPackageIdFound.length) {
            await trx.abort();
            return res.status(400).json({ reason: 'Previous package not found' });
          }
          const previousPackageId = previousPackageIdFound[0];
          await trx.step(() => collectionSucceeds.save({
            _from: pkg._id,
            _to: previousPackageId,
          }));
        } else {
          await trx.abort();
          return res.status(400);
        }
      }
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
