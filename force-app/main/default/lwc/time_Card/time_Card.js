import { LightningElement,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Time_Log__c from '@salesforce/schema/Time_Log__c';
//import NAME_FIELD from '@salesforce/schema/Time_Log__c.Name';
import Description__c from '@salesforce/schema/Time_Log__c.Description__c';
import End_Time__c from '@salesforce/schema/Time_Log__c.End_Time__c';
import Billable__c from '@salesforce/schema/Time_Log__c.Billable__c';
import Hours__c from '@salesforce/schema/Time_Log__c.Hours__c';
import Minutes__c from '@salesforce/schema/Time_Log__c.Minutes__c';
import Project__c from '@salesforce/schema/Time_Log__c.Project__c';
import Start_Time__c from '@salesforce/schema/Time_Log__c.Start_Time__c';
import Task__c from '@salesforce/schema/Time_Log__c.Task__c';
import user__c from '@salesforce/schema/Time_Log__c.user__c';
import Date__c from '@salesforce/schema/Time_Log__c.Date__c';
import { createRecord } from 'lightning/uiRecordApi';
import getUsers from '@salesforce/apex/GetRecords.getUsers';
import getTasks from '@salesforce/apex/GetRecords.getTasksByProject';
import getProjects from '@salesforce/apex/GetRecords.getProjectsByUser';
/**
 *     //fields = [Date__c,user__c,Project__c ,Task__c,Billable__c,Start_Time__c,End_Time__c,Hours__c,Minutes__c,Description__c];
    //objectApiName = Time_Log__c;

 */
export default class Time_Card extends LightningElement {
    userList=[];
    taskList=[];
    projectList=[];
    selectedUser="";
    selectedProject="";
    projectQueryStr="";
    taskQueryStr="";
    
    get projectQuery(){
        console.log("pjstr :"+this.projectQueryStr);
        return this.projectQueryStr;
    }
    get taskQuery(){
        console.log("tskStr:"+this.taskQueryStr);
        return this.taskQueryStr;
    }
    handleSuccess(event) {
        const toastEvent = new ShowToastEvent({
            title: "Time logged succesfully",
            message: "Record ID: " + event.detail.id,
            variant: "success"
        });
        this.dispatchEvent(toastEvent);
    }

    connectedCallback(){
        let userOptions=[];
        getUsers()
        .then(result => {
            for (let key of result) {
                userOptions.push({ label: key.label, value: key.value  });
            }
            this.userList = userOptions;
            console.log("users " + userOptions + " : " + this.userList);
            console.log(userOptions);
        })
        .catch(error => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'error while loading this component',
                message: error,
                variant: 'error',
            }));
        });
    }
    handleUserSelection(event){
        this.selectedUser=event.detail.value;
        this.projectQueryStr="SELECT SUM(Hours__c),SUM(minutes__c),Project__r.name FROM Time_Log__c where User__c=\'"+this.selectedUser+"\' GROUP BY Project__r.name";
        if(this.selectedProject){
            this.taskQueryStr="SELECT SUM(Hours__c),SUM(minutes__c),Task__r.name FROM Time_Log__c where User__c=\'"+this.selectedUser+"\' AND Project__c =\'"+this.selectedProject+"\' GROUP BY Task__r.name";
        }
        let projecOptions=[];
        getProjects({user : this.selectedUser})
        .then(result => {
            for (let key of result) {
                projecOptions.push({ label: key.label, value: key.value  });
            }
            this.projectList = projecOptions;
            console.log("projects" + projecOptions + " : " + this.projectList);
        })
        .catch(error => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'error while loading this component',
                message: error,
                variant: 'error',
            }));
        });
    }
    handleProjectSelection(event){
        try {
            this.selectedProject=event.detail.value;
            if(this.selectedUser){
                this.taskQueryStr="SELECT SUM(Hours__c),SUM(minutes__c),Task__r.name FROM Time_Log__c where User__c=\'"+this.selectedUser+"\' AND Project__c =\'"+this.selectedProject+"\' GROUP BY Task__r.name";
            }

            let taskOptions=[];
            getTasks({project : this.selectedProject})
            .then(result => {
                for (let key of result) {
                    taskOptions.push({ label: key.label, value: key.value  });
                }
                this.taskList = taskOptions;
                console.log("task " + taskOptions + " : " + this.taskList);
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'error while loading this component',
                    message: error,
                    variant: 'error',
                }));
            });
        } catch (error) {
            console.log(error);
        }
        
    }
    get users(){
        return this.userList;
    }
    get tasks(){
        return this.taskList;
    }
    get projects(){
        return this.projectList;
    }
    get currentDate(){
        var date = new Date();
        return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
    }
    addLog(event){
        try{
                    const recordInput = {
                        apiName: Time_Log__c.objectApiName,
                        fields: {
                            [user__c.fieldApiName] : this.template.querySelector(".user").value,
                            [Project__c.fieldApiName] : this.template.querySelector(".project").value,
                            [Task__c.fieldApiName] : this.template.querySelector(".task").value,
                            [Date__c.fieldApiName] :this.template.querySelector(".date").value ,
                            [Start_Time__c.fieldApiName] : this.template.querySelector(".sTime").value,
                            [End_Time__c.fieldApiName] : this.template.querySelector(".eTime").value,
                            [Description__c.fieldApiName] :this.template.querySelector(".desc").value,
                            //[Billable__c.fieldApiName] : (inputList[i+7].value != null )?inputList[i+7].value:false
                        }
                    };

                    createRecord(recordInput)
                        .then(list => {
                            console.log(list);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                    
            
            //[Hours__c.fieldApiName],
            //[Minutes__c.fieldApiName],
            
        }catch(error){
            console.log("error: "+error);
        }
    }
    @track openModal = false;
    showModal() {
        this.openModal = true;
    }
    closeModal() {
        this.openModal = false;
    }
}