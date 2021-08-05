import { LightningElement,wire,track } from 'lwc';

import hasActiveSession from '@salesforce/apex/SessionHandler.hasActiveSession';
import deactivateSession from '@salesforce/apex/SessionHandler.deactivateSession';
import createSession from '@salesforce/apex/SessionHandler.createSession';
import getIP from '@salesforce/apex/SessionHandler.getIP';

import Session__c from '@salesforce/schema/Session__c';
import user__c from '@salesforce/schema/session__c.user__c';
import logged_out__c from '@salesforce/schema/session__c.logged_out__c';

import { createRecord } from 'lightning/uiRecordApi';
//import { publish, MessageContext } from 'lightning/messageService';
//import UserProjectChart from '@salesforce/messageChannel/userProjectChart__c';

export default class LogPage extends LightningElement {
    showLoginForm=true;
    user="";
    ip;
    activeSession;
    projectQueryStr="SELECT SUM(Hours__c),SUM(minutes__c),Project__r.name FROM Time_Log__c where user__c = \'"+this.user+"\' GROUP BY Project__r.name";
    //@wire(MessageContext)
    //messageContext;
    async connectedCallback(){
        /*chrome.storage.local.get(["activeSession"], function(result) {
            this.activeSession=result;
        });
        if(!this.activeSession){
            chrome.storage.local.set({"activeSession": Date.now()}, function() {
                console.log('Value is set to ' + value);
            });
        }*/
        try {
            this.activeSession=window.localStorage.getItem("session");
            //console.log(this.activeSession);
            //console.log("sessionChecking");
            if(!this.activeSession){
                //if(typeof(this.activeSession) === "undefined"){
                    this.activeSession=Date.now()+"";
                window.localStorage.setItem("session",this.activeSession);
                
                //console.log("this active session is",window.localStorage.getItem("session"));
            }else{
                //console.log("in else");
                await hasActiveSession({activeSessionId:this.activeSession})
                    .then(data=>{
                        console.log("hasActiveSession ",data);
                        if(data){
                            console.log(data);
                            this.user=data;
                            this.showLoginForm=false;
                        }
                    })
                    .catch(error=>{
                        console.log(error);
                    });
            }
        } catch (error) {
            console.log(error);
        }
        
    }
    handleLogin(event){
        try {
            //console.log("in handleLogin");
            this.user=event.detail;
            window.localStorage.setItem("session",this.activeSession);
            this.activeSession=window.localStorage.getItem("session");
            createSession({user:this.user,ip: this.activeSession  })
                .then(result => {
                    console.log('session created for',result,this.activeSession); 
                })
                .catch(error => {
                    console.log(error);
                });
            this.showLoginForm=false;
            this.refreshPage();
        } catch (error) {
            console.log(error);
        }
    }
    get projectQuery(){
        if(this.user){
            return "SELECT SUM(Hours__c),SUM(minutes__c),Project__r.name FROM Time_Log__c where user__c = \'"+this.user+"\' GROUP BY Project__r.name";
        }
    }
    get taskQuery(){
        if(this.project){
            return this.taskQueryStr;
        }
    }
    refreshPage(event){
        try {
            /*console.log("refreshPage called");
            const payload = { 
                query: "SELECT SUM(Hours__c),SUM(minutes__c),Project__r.name FROM Time_Log__c where user__c = \'"+this.user+"\' GROUP BY Project__r.name"
               
              };
            publish(this.messageContext, UserProjectChart, payload);*/
            //console.log("refreshing components");
            var table=this.template.querySelector(".LogTable");
            var chart1=this.template.querySelector(".ProjectTaskChart");
            var chart2=this.template.querySelector("c-pie_chart");
            if(table){
                table.reloadData();
            }
            if(chart1){
                chart1.loadData();
            }
            if(chart2){
                chart2.loadData();
            }
        } catch (error) {
            console.log(error);
        }
    }
    logout(event){
        //console.log(this.activeSession);
        deactivateSession({ip:this.activeSession})
        .then(data=> console.log("deactivated sucessfully"))
        .catch(error=> console.log(error));
        window.localStorage.setItem("session",null);

        this.showLoginForm=true;
    }
}