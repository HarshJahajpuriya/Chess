function createGuestAccount(name) {
    console.log('In creteCuestUser')
    return sendXhr('http://localhost:5000/create-guest-user', 'POST', name);
}

function createUser(user) {
    console.log('In createUSer')
    return sendXhr('http://localhost:5000/create-user', 'POST', user);
}

function loginUser(credentials) {
    console.log('In logiUser')
    return sendXhr('http://localhost:5000/login-user', 'POST', {credentials});
}

function getLoggedInUser() {
    console.log('In get Logged in User');
    return sendXhr('http://localhost:5000/get-logged-in-user', 'GET');
}

function findOpponent(opponentId, needsToAdd) {
    console.log("In Find Opponent");
    return sendXhr('http://localhost:5000/find-opponent', 'POST', {opponentId, needsToAdd});
}

function logoutUser() {
    console.log('In Logout User');
    return sendXhr('http://localhost:5000/logout-user', 'GET');
}

function sendXhr(url, method, data) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
    
        xhr.open(method, url);
    
        xhr.responseType = 'json';
    
        xhr.onload = () => {
            if(xhr.status < 400) {
                resolve(xhr.response);
            } else {
                console.log('rejected Here')
                console.log(xhr.status)
                reject(xhr.response);
            }
        }

        xhr.onerror = (ev) => reject(ev);
        xhr.ontimeout = (ev) => reject(ev);

        if(data) {
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.send(JSON.stringify(data));
        } else xhr.send();

    })

}
