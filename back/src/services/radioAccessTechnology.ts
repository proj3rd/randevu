import { Database } from "arangojs";
import { Express } from "express";
import { User } from "randevu-shared/dist/types";
import { COLLECTION_RADIO_ACCESS_TECH } from "../constants";
import {
  handleRequestAddEnum,
  handleRequestGetEnumList,
  handleRequestRenameEnum,
} from "../enum";

export function serviceRadioAccessTech(app: Express, db: Database) {
  app.get("/radio-access-technologies", async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    handleRequestGetEnumList(res, db, COLLECTION_RADIO_ACCESS_TECH);
  });

  app.post("/radio-access-technologies/:docId", (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { docId } = req.params;
    const { name } = req.body;
    handleRequestRenameEnum(res, db, COLLECTION_RADIO_ACCESS_TECH, docId, name);
  });

  app.post("/radio-access-technologies", (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { name } = req.body;
    handleRequestAddEnum(res, db, COLLECTION_RADIO_ACCESS_TECH, name);
  });
}
