

const Friend = require("../model/friends");
const sequelize = require("../utils/database");

module.exports.addFriend = (opponent1, opponent2,  wantsToAddFriend) => {
  console.log("In addFriend controller")

  if(wantsToAddFriend == false) return;

  
  let userInfo = opponent1;
  let friendInfo = opponent2;
  
  console.log(opponent1)
  console.log(opponent2)

  if(userInfo.phone == null || friendInfo.phone == null) {
      console.log("Either one or both user are guest(s)")
      return; 
  }
   
  let friend = {
      userPhone: userInfo.phone,
      friendPhone: friendInfo.phone
  }

  sequelize.query(`Select * from friends where 
      user_phone = ${userInfo.phone} and friend_phone = ${friendInfo.phone} 
      OR
      user_phone = ${friendInfo.phone} and friend_phone = ${userInfo.phone}
      limit 1;
  `, {
      raw : true
  }).then(result => {  
      let data = result[0];
      if(data.length > 0) {
          console.log("Already Friends");
          return;
      } else {
          console.log("Adding to friends")
          Friend.create(friend).then((friend) => {
              console.log(friend);
          }).catch((err) => {
              console.log(err);
          })

          return;
      }  
      console.log('result') 
  }).catch(err => {
      console.log(err)
  }) 

}  