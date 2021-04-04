import { Database } from "arangojs";
import { Express } from "express";
import { User } from "randevu-shared/dist/types";
import { COLLECTION_DEPLOYMENT_OPTION } from "../constants";
import {
  handleRequestAddEnum,
  handleRequestGetEnumList,
  handleRequestRenameEnum,
} from "../enum";

export function serviceDeploymentOption(app: Express, db: Database) {
  app.get("/deployment-options", async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    handleRequestGetEnumList(res, db, COLLECTION_DEPLOYMENT_OPTION);
  });

  app.post("/deployment-options/:docId", (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { docId } = req.params;
    const { name } = req.body;
    handleRequestRenameEnum(res, db, COLLECTION_DEPLOYMENT_OPTION, docId, name);
  });

  app.post("/deployment-options", (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { name } = req.body;
    handleRequestAddEnum(res, db, COLLECTION_DEPLOYMENT_OPTION, name);
  });
}
