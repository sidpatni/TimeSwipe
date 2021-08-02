import { api, LightningElement} from 'lwc';
import getProjects from '@salesforce/apex/GetRecords.getProjectsByUser';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProjectTaskChart extends LightningElement {
    project="";
    projectList=[];
    @api
    user;
    taskQueryStr="SELECT SUM(Hours__c),SUM(minutes__c),Task__r.name FROM Time_Log__c where  User__c =\'"+this.user+"\' AND Project__c =\'"+this.project+"\' GROUP BY Task__r.name";

    

    connectedCallback(){
        this.loadData();
    }
    @api
    loadData(){
        try {
            console.log("load data called");
            let projectOptions=[];
            getProjects({user : this.user})
            .then(result => {
                for (let key of result) {
                    projectOptions.push({ label: key.label, value: key.value  });
                }
                this.projectList = projectOptions;
                this.project=this.projectList[0].value;
                this.resetQuery();
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'error while loading this component',
                    message: "error here ;) -"+error+"",
                    variant: 'error',
                }));
                console.log(error);

            });

        } catch (error) {
            console.log(error);
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
        return this.taskQueryStr;
    }
}