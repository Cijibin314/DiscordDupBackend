class ConnectedUsers{
    connectedUsers;
    constructor(){
        this.connectedUsers = new Map();
    }
    add(username, ws){
        this.connectedUsers.set(username, ws)
    }
    remove(username){
        this.connectedUsers.delete(username)
    }
    get(){
        return [...this.connectedUsers.keys()]
    }
    getWs(username){
        return this.connectedUsers.get(username)
    }
    has(username){
        return this.connectedUsers.has(username)
    }
    updateUsername(oldUsername, newUsername){
        if (this.connectedUsers.has(oldUsername)) {
            const connection = this.getWs(oldUsername);
            this.connectedUsers.set(newUsername, connection);
            this.connectedUsers.delete(oldUsername);
            console.log(`Updated username from ${oldUsername} to ${newUsername}`);
        } else {
            console.log(`Username ${oldUsername} not found in connected users.`);
        }
    }
}
const connectedUsers = new ConnectedUsers()


// Example usage:
module.exports = {
    connectedUsers
}