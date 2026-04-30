const express    = require("express");
const routerLists  = express.Router();
const listController   = require("../controllers/list_api_controllers");

routerLists.get("/",                    listController.getLists);
routerLists.get("/:id",                 listController.getListById);
routerLists.post("/",                   listController.createList);
routerLists.post("/:id/movies",         listController.addMovie);
routerLists.delete("/:id/movies/:tmdbId", listController.removeMovie);
routerLists.delete("/:id",              listController.deleteList);

module.exports = routerLists;