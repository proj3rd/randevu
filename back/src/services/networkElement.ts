import { Database } from "arangojs";
import { Express } from "express";
import { User } from "randevu-shared/dist/types";
import { COLLECTION_NETWORK_ELEMENT } from "../constants";
import {
  handleRequestAddEnum,
  handleRequestGetEnumList,
  handleRequestRenameEnum,
} from "../enum";

export function serviceNetworkElement(app: Express, db: Database) {
  app.get("/network-elements", async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    handleRequestGetEnumList(res, db, COLLECTION_NETWORK_ELEMENT);
  });

  app.post("/network-elements/:name", (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { name } = req.params;
    const { nameNew } = req.body;
    handleRequestRenameEnum(res, db, COLLECTION_NETWORK_ELEMENT, name, nameNew);
  });

  app.post("/network-elements", (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { name } = req.body;
    handleRequestAddEnum(res, db, COLLECTION_NETWORK_ELEMENT, name);
  });
}
