import { Database } from "arangojs";
import { Express } from "express";
import { DocUser } from "randevu-shared/dist/types";
import { COLLECTION_NETWORK_ELEMENT } from "../constants";
import {
  handleRequestAddEnum,
  handleRequestGetEnumList,
  handleRequestRenameEnum,
} from "../enum";

export function serviceNetworkElement(app: Express, db: Database) {
  app.get("/network-elements", async (req, res) => {
    const user = req.user as DocUser;
    if (!user) {
      return res.status(403).end();
    }
    handleRequestGetEnumList(res, db, COLLECTION_NETWORK_ELEMENT);
  });

  app.post("/network-elements/:docKey", (req, res) => {
    const user = req.user as DocUser;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { docKey } = req.params;
    const { name } = req.body;
    handleRequestRenameEnum(res, db, COLLECTION_NETWORK_ELEMENT, docKey, name);
  });

  app.post("/network-elements", (req, res) => {
    const user = req.user as DocUser;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { name } = req.body;
    handleRequestAddEnum(res, db, COLLECTION_NETWORK_ELEMENT, name);
  });
}
