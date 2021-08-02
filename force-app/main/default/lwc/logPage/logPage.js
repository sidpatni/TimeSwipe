import { LightningElement } from 'lwc';


import hasActiveSession from '@salesforce/apex/SessionHandler.hasActiveSession';
import deactivateSession from '@salesforce/apex/SessionHandler.deactivateSession';
import Session__c from '@salesforce/schema/Session__c';

import user__c from '@salesforce/schema/session__c.user__c';
import logged_out__c from '@salesforce/schema/session__c.logged_out__c';
import { createRecord } from 'lightning/uiRecordApi';

export default class LogPage extends LightningElement {
    showLoginForm=true;
    user="";
    projectQueryStr="SELECT SUM(Hours__c),SUM(minutes__c),Project__r.name FROM Time_Log__c where user__c = \'"+this.user+"\' GROUP BY Project__r.name";
    connectedCallback(){
        hasActiveSession()
        .then(data=>{
            if(data){
                console.log(data);
                this.user=data;
                this.showLoginForm=false;
            }
        })
        .catch(error=>{
            console.log(error);
        })
    }
    renderedCallback(){
        console.log("renderedcallback");
    }
    handleLogin(event){
        try {
            console.log("in handleLogin");
            this.user=event.detail;

            const recordInput = {
                apiName: Session__c.objectApiName,
                fields: {
                        [user__c.fieldApiName] : this.user,
                        [logged_out__c.fieldApiName] : false,
                }
            };
            createRecord(recordInput)
                .then(list => {
                    console.log('session created');
                    console.log(list);
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
            console.log("refreshPage called");
            this.template.querySelector(".LogTable").reloadData();
            this.template.querySelector(".ProjectTaskChart").loadData();
            this.template.querySelector("c-pie_chart").loadData();
        } catch (error) {
            console.log(error);
        }
    }
    logout(event){
        deactivateSession()
        .then(data=> console.log("deactivated sucessfully"))
        .catch(error=> console.log(error));
        this.showLoginForm=true;
    }
}