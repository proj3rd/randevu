import { Database } from "arangojs";
import { Express } from "express";
import { DocUser } from "randevu-shared/dist/types";
import { COLLECTION_PRODUCTS } from "../constants";
import {
  handleRequestAddEnum,
  handleRequestGetEnumList,
  handleRequestRenameEnum,
} from "../enum";

export function serviceProduct(app: Express, db: Database) {
  app.get("/products", async (req, res) => {
    const user = req.user as DocUser;
    if (!user) {
      return res.status(403).end();
    }
    handleRequestGetEnumList(res, db, COLLECTION_PRODUCTS);
  });

  app.post("/products/:name", (req, res) => {
    const user = req.user as DocUser;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { name } = req.params;
    const { nameNew } = req.body;
    handleRequestRenameEnum(res, db, COLLECTION_PRODUCTS, name, nameNew);
  });

  app.post("/products", (req, res) => {
    const user = req.user as DocUser;
    if (!user || user.role !== "admin") {
      return res.status(403).end();
    }
    const { name } = req.body;
    handleRequestAddEnum(res, db, COLLECTION_PRODUCTS, name);
  });
}
