const supabase = require('../database');
const fetcher = require('./fetchData.js');
const {Message, toJSON} = require('../../frontend/universal/js/message.js');
async function addUser(username_, password_, email_){
    const {data, error} = await supabase
    .from('Users')
    .insert({
        username: username_,
        password: password_,
        email: email_,
        created_at: new Date()
    })
    const introduction = "Hello, I will be your AI assistant. How can I assist you today?"
    const newMessage = new Message(toJSON(introduction, "AI", username_))
    newMessage.read()
    const {data2, error2} = await supabase
    .from("History")
    .insert({
        conversation: generateConversationLabel({sender: "AI", receiver: username_}),
        histories: [newMessage.toJSON()]
    })
}
function generateConversationLabel(JSONMessage){
    function findClosestString(strings) {
        // Sort the array using localeCompare for case-insensitive comparison
        const sortedStrings = strings.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        // Return the first string (closest to the beginning of the alphabet)
        return sortedStrings[0];
    }
    const sender = JSONMessage.sender
    const receiver = JSONMessage.receiver

    const strings = [sender, receiver]
    
    const closestString = findClosestString(strings);

    if(closestString === sender){
        return `${sender}-${receiver}`
    }else{
        return `${receiver}-${sender}`
    }
}

async function addToHistory(JSONMessage){
    const conversationLabel = generateConversationLabel(JSONMessage);
    // searching for the conversation in the database
    let { data: dataInit, error: errorInit } = await supabase
    .from("History")
    .select("conversation");

    if (errorInit) {
        console.error('Error fetching data:', errorInit.message);
        return;
    }

    if (!dataInit || dataInit.length === 0) {
        console.log('No data found.');
        return;
    }
    // Extract the names from the data
    const names = dataInit.map(row => row["conversation"]);
    //if already in the database, then add to it
    if(names.indexOf(conversationLabel) !== -1){
        //get the current history
        let {data, error} = await supabase
        .from("History")
        .select("histories")
        .eq("conversation", conversationLabel)
        
        data = data[0]["histories"] || []
        data.push(JSONMessage)

        const { data: dataUpdate, error: errorUpdate } = await supabase
        .from("History")
        .update({ histories: data })
        .eq("conversation", conversationLabel);
    }else{//otherwise, make a new one
        const { data: dataNew, error: errorNew } = await supabase
        .from("History")
        .insert([{ conversation: conversationLabel, histories: [JSONMessage] }]);

        if (errorNew) {
            console.error('Error inserting data:', errorNew.message);
            return null;
        }
    }
}
async function newConversationHistory(username1, username2){
    const convLabel = generateConversationLabel({ sender: username1, receiver: username2 });
    const prevData = await fetcher.fetchConvHistory(convLabel)
    if(prevData === "Conversation dosen't exist"){
        const { data: dataNew, error: errorNew } = await supabase
            .from("History")
            .insert([{ conversation: convLabel, histories: [] }]);
            if (errorNew) {
                console.error('Error inserting data:', errorNew.message);
                return null;
            }
    }
}

module.exports = {
    addUser,
    /*setIncomingMessages,
    setOutgoingMessages,
    addMessage,*/
    addToHistory,
    generateConversationLabel,
    newConversationHistory
}

