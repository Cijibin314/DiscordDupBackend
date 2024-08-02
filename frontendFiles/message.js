class Message{
    text = "";
    sender = "";
    receiver = "";
    created_at = null;
    //id = null;
    alreadyRead = false;
    constructor(object){
        this.text = object.text;
        this.sender = object.sender;
        this.receiver = object.receiver;
        if(object.created_at === undefined){
            this.created_at = new Date().toISOString();
        }else{
            this.created_at = object.created_at
        }
        if(object.alreadyRead === undefined){
            this.alreadyRead = false;
        }else{
            this.alreadyRead = object.alreadyRead;
        }
        //this.id = generateUUID()
    }
    /*
    setText(text){
        this.text = text
        return this
    } 
    setSender(senderUsername){
        this.sender = senderUsername
        return this
    }
    setReceiver(receiverUsername){
        this.receiver = receiverUsername
        return this
    }*/

    read(){
        this.alreadyRead = true;
        return this
    }
    getText(){
        return this.text
    }  
    getSender(){
        return this.sender
    }
    getReceiver(){
        return this.receiver
    }
    getCreatedAt(){
        return this.created_at
    }
    setCreatedAt(newCreatedAt){
        this.created_at = newCreatedAt;
        return this
    }
    getRead(){
        return this.alreadyRead
    }
    setUnread(){
        this.alreadyRead = false;
        return this
    }
    /*getId(){
        return this.id
    }*/
    toJSON(){
        const attributes = Object.getOwnPropertyNames(this);
        const json = {};
        for (const key of attributes) {
            json[key] = this[key];
        }
        return json;
    }
}

function toJSON(text, sender, receiver){//will include all the attributes, not just "message"
    return {
        "text": text,
        "sender": sender,
        "receiver": receiver
    }
}

try{
    module.exports = {
        Message,
        toJSON
    };
}catch(e){}