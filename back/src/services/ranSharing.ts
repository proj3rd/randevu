import { Database } from "arangojs";
import { Express } from "express";
import { User } from "randevu-shared/dist/types";
import { COLLECTION_RAN_SHARING } from "../constants";
import {
  handleRequestAddEnum,
  handleRequestGetEnumList,
  handleRequestRenameEnum,
} from "../enum";

export function serviceRanSharing(app: Express, db: Database) {
  app.get("/ran-sharing", async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    handleRequestGetEnumList(res, db, COLLECTION_RAN_SHARING);
  });

  app.post("/ran-sharing/:docKey", (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { docKey } = req.params;
    const { name } = req.body;
    handleRequestRenameEnum(res, db, COLLECTION_RAN_SHARING, docKey, name);
  });

  app.post("/ran-sharing", (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { name } = req.body;
    handleRequestAddEnum(res, db, COLLECTION_RAN_SHARING, name);
  });
}
