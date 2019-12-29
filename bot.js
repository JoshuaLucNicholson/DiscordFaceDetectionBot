'use strict';
const request = require('request');
const Discord = require('discord.js')
const client = new Discord.Client()



client.login(bot_secret_token)

let globalvar1
let globalvar2

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

async function faceRec(url, num, message) {
  const imageUrl = url;
  const params = {
    'returnFaceId': 'true',
    "returnFaceAttributes":
    "age,gender,smile,emotion"
    // "age,gender,headPose,smile,facialHair,glasses,emotion," +
    // "hair,makeup,occlusion,accessories,blur,exposure,noise"
  };
  const options = {
    uri: uriBase,
    qs: params,
    body: '{"url": ' + '"' + imageUrl + '"}',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey
    },
  };

  request.post(options, (error, response, body) => {
    if (error) {
      console.log(error)
      return;
    }
    else {
      console.log(body)
      let checkEmptyBody = body.toString();
      if( checkEmptyBody === '[]'){
        client.channels.get(message).send('Cannot Identify any faces')
        return
      }
      var x = body.replace('[', '')
      var y = JSON.parse(x.replace(']', ''))
      console.log('FaceId' + ': ' + y.faceId)
      if (num == 1) {
        globalvar1 = y.faceId
      }
      if (num == 2) {
        globalvar2 = y.faceId
      }
      if (num == '') {

        client.channels.get(message).send('Gender' + ': ' + y.faceAttributes.gender)
        client.channels.get(message).send('Age' + ': ' + y.faceAttributes.age)
        client.channels.get(message).send('Emotion' + ': ' + JSON.stringify(y.faceAttributes.emotion))
      }
    }
  });
}

async function faceCompare(url1, url2, message) {
  faceRec(url1, 1)
  faceRec(url2, 2)
  await sleep(2000)

  var http = require("https");
  var options = {
    "method": "POST",
    "hostname": "nibbadiscordbot.cognitiveservices.azure.com",
    "port": null,
    "path": "/face/v1.0/verify",
    "headers": {
      "content-type": "application/json",
      "ocp-apim-subscription-key": "e3f6402e2a2d4d4981aedcd07d2d7e91",
      "cache-control": "no-cache",
      "postman-token": "1c73dcb6-af8b-2591-d49f-efcb38b3da2a"
    }
  };

  var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks).toString();
      let bodyJson = JSON.parse(body)
      if(bodyJson.isIdentical){
        client.channels.get(message).send('These 2 images are of the same person')
      }
      else{
        client.channels.get(message).send('These 2 images are of different people')
      }
      globalvar1 = ''
      globalvar2 = ''
    });
  });

  req.write(JSON.stringify({
    faceId1: globalvar1,
    faceId2: globalvar2
  }));

  req.end();
}


client.on('ready', () => {
  console.log("Connected as " + client.user.tag)
  console.log("Servers:")
  client.guilds.forEach((guild) => {
    console.log(" - " + guild.name)
  })
})

client.on('message', function (message) {
  var Attachment = (message.attachments).array();
  if (message.author.bot || message.content !== '') {
    if (message.content === 'Fc'|| message.content === 'fc'|| message.content === 'fC') {
      faceCompare(Attachment[0].url, Attachment[1].url, message.channel.id)
      return
    }
    if (message.content === 'Fr' || message.content === 'fr' || message.content === 'fR') {
      faceRec(Attachment[0].url, 0, message.channel.id)
      return
    }
    return
  }
});