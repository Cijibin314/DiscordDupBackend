const {Interaction} = require('./frontendFiles/interaction.js');
const {connectedUsers} = require("./connectedUsers.js")
const WebSocket = require("ws")
async function readMessage(JSONMessage){
    console.log("Reading JSONMessage TO receiver: ", JSONMessage)
    const sender = JSONMessage["sender"]
    const interaction  = new Interaction({"purpose": "S:readMessage", "JSONMessage": JSONMessage, "wasSucessful": true})
    const JSONInteraction = interaction.toJSON()
    sendJSONInteractionTo(sender, JSONInteraction) // sends the message to sender because the function will only be called as a response to the receiver reading the message, so this tells the sender that the message was read by the receiver
}
async function sendMessage(JSONMessage){
    console.log("Sending message to user: ", JSONMessage)
    const receiver = JSONMessage["receiver"]
    const interaction  = new Interaction({"purpose": "S:newMessage", "JSONMessage": JSONMessage, "wasSucessful": true})
    const JSONInteraction = interaction.toJSON()
    sendJSONInteractionTo(receiver, JSONInteraction)
}
function sendJSONInteractionTo(recipient, JSONInteraction){
    console.log("Trying to send it to: ", recipient)
    if (connectedUsers.has(recipient)) {
        const recipientWs = connectedUsers.getWs(recipient);
        try{
            if (recipientWs.readyState === WebSocket.OPEN) {
                console.log("Sending: ", JSONInteraction)
                recipientWs.send(JSON.stringify(JSONInteraction));
            }
        }catch(e){
            console.log(e)
        }
    } else {
        console.log(`User ${recipient} not found`);
    }
}

module.exports = {
    readMessage,
    sendMessage,
    sendJSONInteractionTo
}