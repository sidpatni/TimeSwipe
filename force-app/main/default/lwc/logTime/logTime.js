import { api, LightningElement,track } from 'lwc';
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
import logTime from '@salesforce/apex/LogData.logTime';
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
    @api
    user;
    get projectQuery(){
        //console.log("pjstr :"+this.projectQueryStr);
        return this.projectQueryStr;
    }
    get taskQuery(){
        //console.log("tskStr:"+this.taskQueryStr);
        return this.taskQueryStr;
    }
    handleSuccess() {
        try {
            const toastEvent = new ShowToastEvent({
                title: "Time logged succesfully",
                message: "",
                variant: "success"
            });
            this.dispatchEvent(toastEvent);
            this.dispatchEvent(new CustomEvent("success"));
        } catch (error) {
            console.log(error);
        }
    }

    connectedCallback(){        
        let projecOptions=[];
        getProjects({user : this.user})
        .then(result => {
            for (let key of result) {
                projecOptions.push({ label: key.label, value: key.value  });
            }
            this.projectList = projecOptions;
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
            let taskOptions=[];
            getTasks({project : this.selectedProject})
            .then(result => {
                console.l
                for (let key of result) {
                    taskOptions.push({ label: key.label, value: key.value  });
                }
                this.taskList = taskOptions;
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'error while loading this component',
                    message: "handleProjectSelection :"+error,
                    variant: 'error',
                }));
            });
        } catch (error) {
            console.log(error);
        }
        
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
    async addLog(event){
        try{
            /*
            const recordInput = {
                apiName: Time_Log__c.objectApiName,
                fields: {
                        [user__c.fieldApiName] : this.user,
                        [Project__c.fieldApiName] : this.template.querySelector(".project").value,
                        [Task__c.fieldApiName] : this.template.querySelector(".task").value,
                        [Date__c.fieldApiName] :this.template.querySelector(".date").value ,
                        [Start_Time__c.fieldApiName] : this.template.querySelector(".sTime").value,
                        [End_Time__c.fieldApiName] : this.template.querySelector(".eTime").value,
                        [Description__c.fieldApiName] :this.template.querySelector(".desc").value,
                        [Billable__c.fieldApiName] : this.template.querySelector(".billable").checked 
                }
            };
            await createRecord(recordInput)
                .then(list => {
                    console.log(list);
                    this.handleSuccess();
                })
                .catch(error => {
                    console.log(error);
                });

         */
            var user= this.user;
            var project = this.template.querySelector(".project").value;
            var task = this.template.querySelector(".task").value;
            var logDate =this.template.querySelector(".date").value ;
            var sTime = this.template.querySelector(".sTime").value;
            var eTime = this.template.querySelector(".eTime").value;
            var descrip =this.template.querySelector(".desc").value;
            var billable = this.template.querySelector(".billable").checked ;
            console.log(logDate);
            await logTime( {user : user, project:project, task:task, logDate: logDate, sTime:sTime, eTime: eTime, descrip: descrip,billable: billable})
                .then(data=>{

                    if(data===200){ 
                        this.handleSuccess();
                    }else if(data === 201){
                        console.log("log failed ,check debug log in developer console for more info");
                    }
                })
                .catch(error=>{
                    console.log(error);
                });
        }catch(error){
            console.log("error= "+error);
        }
    }
    @track openModal = false;
    showModal() {
        this.openModal = true;
    }
    closeModal() {
        this.openModal = false;
    }
    logOut(){
        this.dispatchEvent(new CustomEvent("logout"));
    }
}