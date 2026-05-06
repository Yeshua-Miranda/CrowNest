const express    = require("express");
const routerLists  = express.Router();
const listController   = require("../controllers/list_api_controllers");


const { authMiddelwere } = require('../controllers/users_api_controllers.js'); 

routerLists.get("/", authMiddelwere, listController.getLists);
routerLists.get("/:id", authMiddelwere, listController.getListById);
routerLists.post("/", authMiddelwere, listController.createList);
routerLists.post("/:id/movies", authMiddelwere, listController.addMovie);
routerLists.delete("/:id/movies/:tmdbId", authMiddelwere, listController.removeMovie);
routerLists.delete("/:id", authMiddelwere, listController.deleteList);
routerLists.put("/:id", authMiddelwere, listController.updateList);

module.exports = routerLists;