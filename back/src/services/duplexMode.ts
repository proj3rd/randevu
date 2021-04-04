import { Database } from "arangojs";
import { Express } from "express";
import { User } from "randevu-shared/dist/types";
import { COLLECTION_DUPLEX_MODE } from "../constants";
import {
  handleRequestAddEnum,
  handleRequestGetEnumList,
  handleRequestRenameEnum,
} from "../enum";

export function serviceDuplexMode(app: Express, db: Database) {
  app.get("/duplex-modes", async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    handleRequestGetEnumList(res, db, COLLECTION_DUPLEX_MODE);
  });

  app.post("/duplex-modes/:docKey", (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { docKey } = req.params;
    const { name } = req.body;
    handleRequestRenameEnum(res, db, COLLECTION_DUPLEX_MODE, docKey, name);
  });

  app.post("/duplex-modes", (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { name } = req.body;
    handleRequestAddEnum(res, db, COLLECTION_DUPLEX_MODE, name);
  });
}
