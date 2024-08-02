const fetcher = require("./interactions/fetchData.js");
const inserter = require("./interactions/insertData.js");
const deleter = require("./interactions/deleteData.js");
const updater = require("./interactions/updateData.js")
const emailer = require("./sendEmail.js")
const sender = require("./sender.js")
const ai = require("./ai.js")
const connectedUsers = require("./connectedUsers.js")
const {Message, toJSON} = require('../frontend/universal/js/message.js');
const {Interaction} = require('../frontend/universal/js/interaction.js');
//outgoing really means unread
//REALLY IMPORTANT ^^^
async function checkIncomingMessages(username){
    return await fetcher.getIncomingMessages(username)
}

async function handleResponse(ws, JSONInteraction){
    const interaction = new Interaction(JSONInteraction)
    const id = interaction.getId()
    let response;
    console.log("Purpose of interaction: ", interaction.getPurpose())
    switch(interaction.getPurpose()){
        case "setWebsocketName":
            try{   
                const previousName = interaction.getUsername()
                const newName = interaction.getAdditionalText()
                connectedUsers.updateUsername(previousName, newName)
                response = new Interaction({purpose: "setWebsocketName", wasSucessful: true, "id":id})
            }catch(e){
                console.log(`Failed to set websocket name with interaction: ${interaction.toJSON()}`)
                response = new Interaction({purpose: "setWebsocketName", wasSucessful: false, errorMessage: e, "id":id})
            }
        case "userConversations":
            try{
                let username = interaction.getUsername()
                const myList = await fetcher.fetchUserConversationTitles(username)
                response = new Interaction({purpose: "userConversations", conversationTitles: myList, wasSucessful:true, "id":id})
            }catch(e){
                console.log(`Failed to fetch user conversations with interaction: ${interaction.toJSON()}`)
                response = new Interaction({purpose: "userConversations", wasSucessful:false, errorMessage: e, "id":id})
            }
            break;
        case "messageRead":
            try{
                let JSONMessage = interaction.getJSONMessage()
                console.log("Trying to read message: ", JSONMessage)
                await updater.readMessage(JSONMessage)
                await sender.readMessage(JSONMessage)
                response = new Interaction({purpose: "messageRead", wasSucessful:true, "id":id})
            }catch(e){
                response = new Interaction({purpose: "messageRead", wasSucessful:false, errorMessage: e, "id":id})
            }
            break;
        case "message":
            //adds message to long-term storage
            try{
                let JSONMessage = interaction.getJSONMessage()
                await inserter.addToHistory(JSONMessage)
                await sender.sendMessage(JSONMessage)
                //possibly generates a response if it it to the ai
                if(JSONMessage["receiver"] === "AI"){
                    await updater.readMessage(JSONMessage)
                    await sender.readMessage(JSONMessage)
                    let prompt = JSONMessage["text"]
                    let completion = await ai.generateCompletion(prompt)
                    console.log("Generated completion: ", completion, " to prompt: ", prompt)
                    const newMessage = new Message(toJSON(completion, "AI", JSONMessage["sender"]))
                    newMessage.read()
                    await inserter.addToHistory(newMessage.toJSON())
                    response = new Interaction({purpose: "message", JSONMessage: newMessage.toJSON(), additionalText: "aiResponse", wasSucessful: true, "id": id})
                    ///TODO:  go into frontend and remove speciifc purposes for ai completions. Add handers therough the message puropose 
                }else{
                    response = new Interaction({purpose: "message", wasSucessful:true, "id":id})
                }
            }catch(e){
                console.log(`Failed to add message with interaction: , ${interaction.toJSON()} and JSONMessage: `, interaction.getJSONMessage())
                response = new Interaction({purpose: "message", wasSucessful:false, errorMessage: e, "id":id})
            }
            break;
        case "listOfMessages":
            try{
                let convName = interaction.getConvName()
                let result = await fetcher.fetchConvHistory(convName)
                if(result === "Conversation dosen't exist"){
                    console.log("Conversation dosen't exist, serverHelper")
                    response = new Interaction({purpose: "listOfMessages", wasSucessful:true, errorMessage: "Conversation dosen't exist", "id":id, "convName": convName})
                }else{
                    response = new Interaction({purpose: "listOfMessages", JSONMessages: result, wasSucessful:true, "id":id, "convName": convName})
                    console.log(`Found data for ${convName}: `, result)
                }
            }catch(e){
                response = new Interaction({purpose: "listOfMessages", wasSucessful:false, errorMessage: e, "id":id, "convName": convName})
            }
            break;
        case "validateUser":
            try{
                let username = interaction.getUsername()
                let password = interaction.getPassword()
                let result = await fetcher.fetchUserPassword(username)
                if(result !== "User not found"){
                    if(password === result){
                        response = new Interaction({purpose: "validateUser", userValidated: true, wasSucessful: true, "username": username, "id":id})
                    }else{
                        console.log("IncorrectPassword")
                        response = new Interaction({purpose: "validateUser", userValidated: false, wasSucessful: true, "id":id, "additionalText":"Incorrect Password"})
                    }
                }else{
                    response = new Interaction({purpose: "validateUser", userValidated: false, wasSucessful: true, "id":id, "additionalText":"Incorrect Username"})
                }
            }catch(e){
                console.log("Server failed at validating user: ")
                response = new Interaction({purpose: "validateUser", wasSucessful:false, errorMessage: e, "id":id})

            }
            break;
        case "addUser":
            try{
                let username = interaction.getUsername()
                let password = interaction.getPassword()
                let email = interaction.getEmail()
                await inserter.addUser(username, password, email)
                response = new Interaction({purpose: "addUser", wasSucessful:true, "id":id})
            }catch(e){
                response = new Interaction({purpose: "addUser", wasSucessful:false, errorMessage: e, "id":id})
            }
            break;
        case "deleteUser":
            try{
                let username = interaction.getUsername()
                await deleter.deleteUser(username)
                response = new Interaction({purpose: "deleteUser", wasSucessful:true, "id":id})
            }catch(e){
                response = new Interaction({purpose: "deleteUser", wasSucessful:false, errorMessage: e, "id":id})
            }
            break;
        case "deleteMessage":
            try{
                let JSONMessage = interaction.getJSONMessage()
                await deleter.deleteMessage(JSONMessage)
                response = new Interaction({purpose: "deleteMessage", wasSucessful:true, "id":id})
            }catch(e){
                response = new Interaction({purpose: "deleteMessage", wasSucessful:false, errorMessage: e, "id":id})
            }
            break;
        case "listOfUnreadMessages":
            try{
                let username = interaction.getUsername()
                const unreadMesages = await fetcher.fetchUnreadMessages(username)
                response = new Interaction({purpose: "listOfUnreadMessages", wasSucessful:true, JSONMessages:unreadMesages, "id":id})
            }catch(e){
                response = new Interaction({purpose: "listOfUnreadMessages", wasSucessful:false, errorMessage: e, "id":id})
            }
        case "setPassword":
            try{
                let username = interaction.getUsername()
                let password = interaction.getPassword()
                const confirmation = await updater.setPassword(username, password)
                if(confirmation === "User not found"){
                    response = new Interaction({purpose: "setPassword", wasSucessful: false, "id": id, errorMessage: "User does not exist"})
                }else{
                    response = new Interaction({purpose: "setPassword", wasSucessful: true, "id":id})
                }
            }catch(e){
                response = new Interaction({purpose: "setPassword", wasSucessful: false, errorMessage: e, "id":id})
            }
            break;
        case "sendEmail":
            try{
                let email = interaction.getEmail()
                let username = interaction.getUsername()
                await emailer.sendEmail(email, username)
                response = new Interaction({purpose: "sendEmail", wasSucessful: true, "id":id})
            }catch(e){
                response = new Interaction({purpose: "sendEmail", wasSucessful: false, errorMessage: e, "id":id})
            }
            break;
        case "getEmailAddress":
            try{
                let username = interaction.getUsername()
                let email = await fetcher.fetchUserEmail(username)
                response = new Interaction({purpose: "getEmailAddress", wasSucessful: true, email: email, "id":id})
            }catch(e){
                response = new Interaction({purpose: "getEmailAddress", wasSucessful: false, errorMessage: e, "id":id})
            }
            break;
        case "userExists":
            try{
                let username = interaction.getUsername()
                let result = await fetcher.fetchUser(username)
                console.log("Given username:" , username)
                if(result !== "User not found"){
                    response = new Interaction({purpose: "userExists", additionalText: true, wasSucessful: true, "id":id, "username": username})
                }else{
                    response = new Interaction({purpose: "userExists", additionalText: false, wasSucessful: true, "id":id, "username":username})
                }
            }catch(e){
                response = new Interaction({purpose: "userExists", wasSucessful: false, errorMessage: e, "id":id})
            }
            break;
        case "newConversationHistory":
            try{
                let username1 = interaction.getUsername()
                let username2 = interaction.getAdditionalText()
                await inserter.newConversationHistory(username1, username2)
                response = new Interaction({purpose: "newConversationHistory", wasSucessful: true, "id":id})
            }catch(e){
                response = new Interaction({purpose: "newConversationHistory", wasSucessful: false, errorMessage: e, "id":id})
            }
            break;
        /*case "aiCompletion":
            try{
                const prompt = interaction.getAdditionalText()
                const username = interaction.getUsername()
                await adder.addToHistory()
                const completion = await ai.generateCompletion(prompt)
                console.log("Completion: ", completion)
                const message = new Message(toJSON(completion, "AI", username))
                const JSONMessage = message.toJSON()
                await inserter.addToHistory(JSONMessage)
                response = new Interaction({purpose: "aiCompletion", "JSONMessage": JSONMessage, wasSucessful: true, "id":id})
            }catch(e){
                response = new Interaction({purpose: "aiCompletion", wasSucessful: false, errorMessage: e, "id":id})
            }
            break;
                */
        case "setMaxLength": 
            try{
                let maxLength = interaction.getAdditionalText()
                //maxLength = JSON.parse(maxLength)
                ai.setMaxLength(maxLength)
                response = new Interaction({purpose: "setMaxTokens", wasSucessful: true, "id":id})
            }catch(e){
                response = new Interaction({purpose: "setMaxTokens", wasSucessful: false, errorMessage: e, "id":id})
            }
            break;
        default:
            console.log("Interaction: ", JSONInteraction)
            console.error("Error: No functoinality of interaction specified")
            response = new Interaction({purpose: "invalidInteraction", wasSucessful: true, errorMessage: `Error: No functoinality of interaction specified: ${JSONInteraction}`})
    }
    ws.send(JSON.stringify(response.toJSON()))
  }

module.exports = {
    checkIncomingMessages,
    handleResponse
}