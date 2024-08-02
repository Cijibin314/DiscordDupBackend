const supabase = require('../database');
const inserter = require('./insertData.js');
const {Message, toJSON} = require('../../frontend/universal/js/message.js');


async function readMessage(JSONMessage){
    let newMessage = new Message(JSONMessage)
    if(!newMessage.getRead()){
        newMessage.read()
        const newMessageJSON = newMessage.toJSON()
        const convLabel = inserter.generateConversationLabel(JSONMessage)
        //gets the old history
        let { data: oldHistory, error: errorInit } = await supabase
            .from("History")
            .select("histories")
            .eq("conversation", convLabel)
        if (errorInit) {
            console.error('Error fetching data:', errorInit.message);
            return;
        }
        oldHistory = oldHistory[0]["histories"]
        //updates the history to contain the newly read message
        let newHistory = []
        for (const JSONmsg of oldHistory){
            if(JSON.stringify(JSONmsg) === JSON.stringify(JSONMessage)){
                newHistory.push(newMessageJSON)
            }else{
                newHistory.push(JSONmsg)
            }
        }
        //sets the history to newHistory
        const { data: dataUpdate, error: errorUpdate } = await supabase
        .from("History")
        .update({ "histories": newHistory })
        .eq("conversation", convLabel);
    }else{
        return "Message already read" // shouldm't matter, this should just never happen
    }
}
async function setPassword(username, password){
    let {data, error} = await supabase
    .from("Users")
    .update({"password": password})
    .eq("username", username)
    if(error){
        return "Error setting password"
    }
    return true
}

module.exports = {
    readMessage,
    setPassword
}