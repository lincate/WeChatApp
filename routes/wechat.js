/**
 * Created by Jovo on 4/28/2016.
 */
var express = require('express');
var router = express.Router();

var wechat = require('wechat');
var config = require('../config.js');
var fs = require('fs');
var mapping  = new Mapping();
/*
var API = require('wechat-api');
var api = new API(config.appid, config.secret,function(callback){
    fs.readFile('./access_token.txt','utf8',function(err,txt){
       if(err){
           console.log('Failed to access token file ');
           console.log(err);
           return callback(err);
       }
        callback(null,JSON.parse(txt));
    });
},function(token,callback){
        fs.writeFile('./access_token.txt',JSON.stringify(token),callback);
    }
);
*/

var API = require('wechat-api');
var api = new API(config.appid, config.secret);
router.use('/', wechat(config, function (req, res, next) {
    var fund = fs.readFileSync('./funds.json');
    var detail = '';
    if(fund){
        detail = JSON.parse(fund);
    }
    api.getAccessToken(function (err,token){
        console.log(err);
    });

    // 微信输入信息都在req.weixin上
    var message = req.weixin;
    var msgtype = message.MsgType;
    if(msgtype=='event'){
        var eventType = message.Event;
        var respMessage = '';
        if(eventType.EventKey=='DONATE_SUB_DONATE'){
            respMessage = 'Thank you'+message.FromUserName+'!';

            res.reply({
                content: respMessage,
                type: 'text'
            });
        }else if(eventType.EventKey=='DONATE_SUB_FUND'){
            respMessage = 'Amy 10; \n Andy Chen:10;\n Andy Li:10;\n Anders:10; \n Total: 40';
            res.reply({
                content: respMessage,
                type: 'text'
            });
        }else if(eventType.EventKey=='AGILE'){
            respMessage = 'Become Agile!'
            res.reply({
                content: respMessage,
                type: 'text'
            });
        }

    }
    if(msgtype=='text'){
        console.log(message.Content);
        var resMsg = '';
        if (message.Content.toLowerCase() === 'detail') {
            if(detail){
                var length = detail.length;
                for(var i=0;i<length;i++){
                    resMsg+=detail[i].Name+' donanted at '+ detail[i].Date +'\n';
                }
                resMsg+='\n';
                resMsg+='Total is :'+ length*10;
            }
            res.reply({
                content: resMsg,
                type: 'text'
            });
        }else if(message.Content.toLowerCase() === 'donate'){
            if(detail){
                var length = detail.length;
                var date = new Date();
                var dateStr = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDay();
                var name = mapping.get(message.FromUserName);
                var donateRecord = {'Name':name,'Date':dateStr};
                detail.push(donateRecord);
                fs.writeFile('./funds.json',JSON.stringify(detail),function(err,result){
                    if(err){
                        console.log(err);
                    }
                });
                resMsg+='Total is :'+ (length+1)*10;
            }
            res.reply({
                content: resMsg,
                type: 'text'
            });
        }else if(message.Content.toLowerCase().substr(0,4) == 'i am'){
            var name = message.Content.substr(4);
            resMsg += message.FromUserName + ' is ' + name;
            console.log(resMsg);
            res.reply({
                content: resMsg,
                type: 'text'
            });
        }else if(message.Content.toLowerCase()==='help'){
            resMsg+='Command can be used\n\n';
            resMsg+='\<I am yourname\>, show your userId \n';
            resMsg+='\<Detail\>, show the fund detail \n';
            resMsg+='\<Donate\>, Donate 10 into fund \n';
            res.reply({
                content: resMsg,
                type: 'text'
            });
        }
        else {
            // 回复高富帅(图文回复)
            res.reply([
                {
                    title: 'Welcome',
                    description: 'Welcome to Happy Team',
                    picurl: 'http://img01.taopic.com/150920/240455-1509200H31810.jpg',
                    url: 'http://www.baidu.com'
                }
            ]);
        }
    }

}));

function Mapping(){
    /*创建构造器，有key和value*/
    var struct = function(key , value){
        this.key = key;
        this.value = value ;
    }
    /*根据容器获取容器中的值*/
    var get = function(key){
        for(var x=0;x<this.arr.length;x++){
            if(this.arr[x].key == key){
                return this.arr[x].value;
            }
        }
        return null;
    }
    /*构建数组*/
    this.arr = new Array();
    this.arr[0] = new struct('oYvDfw_CriEV3lPmNxv5yGQt0dVc' , 'Andy Li');
    this.arr[1] = new struct('oYvDfwyl6tQOZLvgj9auKBlxXzoI' , 'Amy');
    this.arr[2] = new struct('oYvDfw_OSHuz0UT-oVjgkHMc1SBY' , 'Grover');
    this.arr[3] = new struct('oYvDfw_MYbpKzkVEbq9POzDDNyKY' , 'Andy Chen');
    this.arr[4] = new struct('oYvDfwyJSN2AhRx4-SYG4cK2tYuQ' , 'Anders');
    this.arr[5] = new struct('oYvDfw8mOEpPwykcogK7acGROVwg' , 'Tina');
    this.arr[6] = new struct('oYvDfw711ghJyMSNTegvuif6iT6w' , 'Jovo');
    /*Init Name Mapping*/

    this.get = get;
};

module.exports = router;