const inserter = require('./insertData.js');
const {Message, toJSON} = require('../../frontend/universal/js/message.js');
const supabase = require('../database');


Array.prototype.stringifyElements = function stringifyElements(){
    let newArr = []
    for(let i = 0; i < this.length; i++){
        newArr.push(JSON.stringify(this[i]))
    }
    return newArr
}
Array.prototype.parseElements = function parseElements(){
    let newArr = []
    for(let i = 0; i < this.length; i++){
        newArr.push(JSON.parse(this[i]))
    }
    return newArr
}


async function deleteUser(username){
    const { data, error } = await supabase
        .from('Users')
        .delete()
        .eq('username', username); // Replace 'primary_key_column' with your actual primary key column name

    if (error) {
        console.error('Error deleting row:', error);
    }
}


async function deleteMessage(JSONMessage){
    const message = new Message(JSONMessage)
    const convLabel = inserter.generateConversationLabel(JSONMessage)
    //setting the outgoing messages
    // Getting place in the database where the username is
    let { data: dataStart, error: errorStart} = await supabase
        .from('History')
        .select("*")
        .eq("conversation", convLabel);

    if (errorStart) {
        console.error('Error fetching data:', errorStart);
        return "Failure";
    }
    let data = dataStart[0]["histories"]
    // update the array. Objects can only be comapred in their stringified form aparrently, so I needed to stringify the elemets for comparison
    data = data.stringifyElements()
    data.splice(data.indexOf(JSON.stringify(JSONMessage)), 1);
    data = data.parseElements()
    const { data: dataUpdate, error: errorUpdate } = await supabase
        .from("History")
        .update({ histories: data })
        .eq("conversation", convLabel);
}

module.exports = {
    /*deleteMessage,
    deleteSenderMessage,
    deleteReceiverMessage,*/
    deleteUser,
    deleteMessage
}