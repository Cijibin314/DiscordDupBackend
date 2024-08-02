let MessageForBackend;
try{
    const MessageFile = require('./message.js');
    MessageForBackend = MessageFile.Message
}catch(e){}//this should happen

function generateUUID() {
    let d = new Date().getTime(); // Timestamp
    let d2 = (performance && performance.now && (performance.now()*1000)) || 0; // Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = Math.random() * 16; // Random number between 0 and 16
      if(d > 0){ // Use timestamp until depleted
        r = (d + r)%16 | 0;
        d = Math.floor(d/16);
      } else { // Use microseconds since page-load if supported
        r = (d2 + r)%16 | 0;
        d2 = Math.floor(d2/16);
      }
      return (c==='x' ? r : (r&0x3|0x8)).toString(16);
    });
  }



const possiblePurposes = [
    "messageRead",
    "message",
    "listOfMessages",
    "validateUser", 
    "addUser",
    "deleteUser",
    "deleteMessage",
    "listOfUnreadMessages",
    "userConversations",
    "setPassword",
    "sendEmail",
    "getEmailAddress",
    "userExists",
    "newConversationHistory",
    "setWebsocketName",
    // "aiCompletion",
    "setMaxLength",
    // purposes preceeded by:    "S:" are initialized by the server to the client
    "S:readMessage", // infering the past tense of read
    "S:newMessage",
    "invalidInteraction" //only used from server to client, saying that the client messed up its request. Should never happen
]
function possiblePurpose(purpose){
    for(const possiblePurpose of possiblePurposes){
        if(possiblePurpose === purpose){
            return true
        }
    }
    return false
}  

class Interaction{
    //data that it used on each side
    //default values
    JSONMessages = [];
    username = "";
    password = "";
    userValidated = false;
    convName = "";
    wasSucessful = false;
    errorMessage = "";
    // tells each side what to look for in the interaction
    purpose = "";
    JSONMessage = {};
    id = ""
    conversationTitles = []
    additionalText = ""
    email = ""

    //takes in a JSONinteraction object
    //purpose is REQUIRED
    constructor({
        //fills in default values
        purpose=this.purpose, 
        JSONMessages=this.JSONMessages, 
        username=this.username, 
        password=this.password, 
        userValidated=this.userValidated, 
        JSONMessage = this.JSONMessage, 
        convName=this.convName,
        wasSucessful=this.wasSucessful,
        errorMessage=this.errorMessage,
        id=this.id,
        conversationTitles=this.conversationTitles,
        additionalText=this.additionalText,
        email=this.email
    }){
        //idk if this is needed, but assigns defaults to the actual values
        this.JSONMessages = JSONMessages;
        this.JSONMessage = JSONMessage;
        this.wasSucessful = wasSucessful;
        this.username = username;
        this.convName = convName;
        this.password = password;
        this.errorMessage = errorMessage;
        this.userValidated = userValidated;
        this.conversationTitles = conversationTitles;
        this.additionalText = additionalText;
        this.email = email
        //fills in values only if they exist
        if(!id){
            this.id = generateUUID()
        }else{
            this.id = id
        }
        if(possiblePurpose(purpose)){
            this.purpose = purpose;
        }else{
            console.error("Invalid purpose when initializing: ", purpose)
        }
    }
    setId(id){
        this.id = id;
    }
    getPurpose(){
        return this.purpose
    }
    getId(){
        return this.id
    }
    getJSONMessages(){
        return this.JSONMessages;
    }
    getAdditionalText(){
        return this.additionalText;
    }
    getJSONMessage(){
        return this.JSONMessage;
    }
    getUsername(){
        return this.username;
    }
    getEmail(){
        return this.email;
    }
    getErrorMessage(){
        return this.errorMessage;
    }
    getPassword(){
        return this.password
    }
    getSucessful(){
        return this.wasSucessful;
    }
    getConvName(){
        return this.convName;
    }
    getValidation(){
        return this.userValidated;
    }
    getConversationTitles(){
        return this.conversationTitles;
    }
    toJSON(){
        const attributes = Object.getOwnPropertyNames(this);
        const json = {};
        for (const key of attributes) {
            json[key] = this[key]
        }
        return json;
    }
}
// example of an initialization and utilization: 
// const interaction = new Interaction({purpose : "validateUser", username : "myUsername"})
// const JSONinteraction = interaction.toJSON()
// const interaction2 = new Interaction(JSONinteraction)
// console.log(interaction2.toJSON()) // same as JSONinteraction

try{
    module.exports = {
        Interaction
    }
}catch{}