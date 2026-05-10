const usersControllers = require( '../controllers/users_api_controllers.js');

const express = require('express'); 

const routerUsers = express.Router();
routerUsers.post('/',usersControllers.registerUser);


routerUsers.get("/other/:id", usersControllers.authMiddelwere, usersControllers.getOtherUser);

routerUsers.post('/add-friend/:id', usersControllers.authMiddelwere, usersControllers.addFriend);

routerUsers.post('/friend-request/:requestId', usersControllers.authMiddelwere, usersControllers.handleFriendRequest);

routerUsers.get('/:type/:id',usersControllers.getUsers);


routerUsers.use('/:id', usersControllers.authMiddelwere);

routerUsers.get('/:id', usersControllers.getUser);

routerUsers.put('/:id',usersControllers.updateUserInfo);

routerUsers.delete('/:id',usersControllers.deleteUserInfo);

module.exports = routerUsers;   