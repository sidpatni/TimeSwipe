import { api, LightningElement, wire} from 'lwc';
import getProjects from '@salesforce/apex/GetRecords.getProjectsByUser';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


import { publish, MessageContext } from 'lightning/messageService';
import RefreshChart from '@salesforce/messageChannel/refreshChart__c';

export default class ProjectTaskChart extends LightningElement {
    taskQueryStr="SELECT SUM(Hours__c),SUM(minutes__c),Task__r.name FROM Time_Log__c where  User__c =\'"+this.user+"\' AND Project__c =\'"+this.project+"\' GROUP BY Task__r.name";
    project="";
    projectList=[];
    @api
    user;
    @wire(MessageContext)
    messageContext;
    connectedCallback(){
        try {
            let projectOptions=[];
            getProjects({user : this.user})
            .then(result => {
                for (let key of result) {
                    projectOptions.push({ label: key.label, value: key.value  });
                }
                this.projectList = projectOptions;
                this.project=this.projectList[0].value;
                this.loadData();

            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'error while loading this component',
                    message: error+"",
                    variant: 'error',
                }));
            });
        } catch (error) {
            console.log(error);
        }
    }
    @api
    loadData(){
        let pieChart=this.template.querySelector("c-pie_chart");
        this.taskQueryStr="SELECT SUM(Hours__c),SUM(minutes__c),Task__r.name FROM Time_Log__c where  User__c =\'"+this.user+"\' AND Project__c =\'"+this.project+"\' GROUP BY Task__r.name";

        if(pieChart){
            this.template.querySelector("c-pie_chart").loadData();
            /*const payload = { 
                operator: 'add',
                constant: 1
              };
              publish(this.messageContext, COUNT_UPDATED_CHANNEL, payload);*/
            
        }
    }
    get projects(){
        console.log('available projects : '+this.projectList.length);
        return this.projectList;
    }
    resetQuery(){
        this.taskQueryStr="SELECT SUM(Hours__c),SUM(minutes__c),Task__r.name FROM Time_Log__c where  User__c =\'"+this.user+"\' AND Project__c =\'"+this.project+"\' GROUP BY Task__r.name";
    }
    handleProjectSelection(event){
        this.project=event.detail.value;
        this.resetQuery();
    }
    get query(){
        console.log("getQuery "+this.taskQueryStr);
        return this.taskQueryStr;
    }
}