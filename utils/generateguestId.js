module.exports.generateGuestId = function() {
    let tmpId = parseInt(Math.random() * 1000000000) + 9000000000;
    if(loggedInUsersSocketMap.has(tmpId)) {
        while(loggedInUsersSocketMap.has(tmpId)) {
            tmpId = parseInt(Math.random() * 10000000000) + 9000000000;
        }
    }
    tmpId = tmpId.toString();
    return tmpId;
} 
