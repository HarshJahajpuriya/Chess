class MapUser { 
    constructor(user, socket) {
        this.user = user;
        this.socket = socket;
        this.isUserPlaying = false;
        this.gameId = null;
    }
}
 
module.exports = MapUser;