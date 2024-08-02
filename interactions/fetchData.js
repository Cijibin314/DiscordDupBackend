// fetchData.js

const supabase = require('../database');
const {Message, toJSON} = require('../../frontend/universal/js/message.js');
async function fetchUser(username) {
  try {
    let { data, error } = await supabase
      .from('Users')
      .select()
      .eq("username", username)
    if(JSON.stringify(data) === JSON.stringify([])){
      return "User not found";
    }
    return data[0]
  } catch (error) {
    console.error('Error fetching users:', error);
    return "Error";
  }
}
async function fetchUserPassword(username){
  return fetchUser(username).then(res=>{
    if(res !== "User not found"){
      return res["password"]
    }else{
      return "User not found";
    }
  })
}
async function fetchUserEmail(username){
  return fetchUser(username).then(res=>{
    if(res !== "User not found"){
      return res["email"]
    }else{
      return "User not found";
    }
  })
}
// async function fetchUserMessages(username) {
//     try {
//       let { data, error } = await supabase
//         .from('Messages')
//         .select()
//       if (error) {
//         throw error;
//       }
//       for (let object of data){
//         let username_ = object["username"];
//         if(username_ === username){
//             return object
//         }
//       }
//       return data;
//     } catch (error) {
//       console.error('Error fetching users:', error.message);
//       return [];
//     }
// }
async function fetchConvHistory(convName){
  const { data, error } = await supabase
  .from("History")
  .select("histories")
  .eq("conversation", convName)
  
  if (data.length === 0) {
      console.log("Conv dosen't existtt");
      return "Conversation dosen't exist";
  }
  return data[0]["histories"];
}

async function fetchUserConversationTitles(username){
  let { data, error } = await supabase
 .from("History")
 .select("conversation")
 
 if (error) {
     console.error('Error fetching data:', error);
     return null;
 }
 let listOfConvNames = []
 for (obj of data){
      const convName = obj.conversation
      if(convName.includes(username)){
          listOfConvNames.push(convName)
      }
 }
 return listOfConvNames;
}


async function fetchUnreadMessages(username){
  let listOfUnreadMessages = []
  let { data : listOfConvNames, error } = await supabase
  .from("History")
  .select("conversation")
  
  if (error) {
      console.error('Error fetching data:', error);
      return null;
  }
  //transforms it from a list of objects with one key of conversation and value of the conv name to a list of the conv names
  for (const obj of listOfConvNames){
    listOfConvNames[listOfConvNames.indexOf(obj)] = obj["conversation"]
  }

  for(const convName of listOfConvNames){
    if(convName.includes(username)){
      let {data: history, error2} = await supabase
      .from("History")
      .select("histories")
      .eq("conversation", convName)
      if (error2) {
        console.error('Error fetching data:', error2);
        return null;
      }
      history = history[0]["histories"]
      for(const JSONMessage of history){
        const message = new Message(JSONMessage)
        if(!message.getRead() && message.getReceiver() === username){
          listOfUnreadMessages.push(JSONMessage)
        }
      }
    }
  }
  return listOfUnreadMessages;
}

module.exports = {
    fetchUserPassword,
    fetchUserEmail,
    fetchUser,
    fetchConvHistory,
    fetchUnreadMessages,
    fetchUserConversationTitles
}