import { api, LightningElement, track, wire } from 'lwc';
import getLogs from '@salesforce/apex/LazyLoadingController.getLogs';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


const columns = [
    //{ label: 'Id', fieldName: 'Id', type: 'text' , sortable: true},
    //{ label: 'Name', fieldName: 'Name', type: 'text', sortable: true},
    { label: 'Project', fieldName: 'Project', type: 'text', sortable: true},
    { label: 'Task', fieldName: 'Task', type: 'text', sortable: true},
    { label: 'Time', fieldName: 'Time', type: 'text', sortable: false, initialWidth :100},
    //{ label: 'Minutes', fieldName: 'Minutes__c', type: 'text', sortable: true},
    { label: 'Date', fieldName: 'Date__c', type: 'date', sortable: true, initialWidth :100},
    { label: 'Billable', fieldName: 'Billable__c', type: 'boolean', sortable: true , initialWidth :90},
    { label: 'Description', fieldName: 'Description', type: 'text', sortable: false , initialWidth :300,wrapText:true}
];

export default class LogTable extends LightningElement {
    queryResult=[];
    error;
    columns = columns;
    rowLimit =20;
    rowOffSet=0;
    @api
    user;
    // data table
        defaultSortDirection = 'asc';
        sortDirection = 'asc';
        sortedBy;
        targetDatatable=null;
    connectedCallback() {
        this.loadData();
    }
    @api
    reloadData(){
        this.queryResult=[];
        this.error;
        this.columns = columns;
        this.rowLimit =20;
        this.rowOffSet=0;
        this.defaultSortDirection = 'asc';
        this.sortDirection = 'asc';
        this.sortedBy;
        this.loadData();
        //console.log("reload data called successfully");
        if(this.targetDatatable){
            console.log("enableInfiniteLoading enabled");
            this.targetDatatable.enableInfiniteLoading = true;
        }
    }
    loadData(){
        try {
            //console.log("loadDataCalled");
            return  getLogs({ limitSize: this.rowLimit , offset : this.rowOffSet ,user:this.user})
            .then(result => {
                //console.log("result length :"+result.length);
                if(result.length < 1 && this.targetDatatable){
                    this.targetDatatable.enableInfiniteLoading = false;
                    return;
                }
                let data=[];
                result.forEach(i=>{
                    if(i.Project__r){
                        data.push( { id: i.Id, Project:i.Project__r.Name ,Task:i.Task__r.Name, Date__c : i.Date__c,Time: i.Hours__c +"."+ (i.Minutes__c*100/60) +" Hours",Billable__c:i.Billable__c,Description:i.Description__c});
                    }
                });
                let updatedRecords = [...this.queryResult, ...data];

                this.queryResult = updatedRecords;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                console.log(error);
                this.queryResult = undefined;
            });
        } catch (error) {
            console.log(error);
        }
        
    }

    loadMoreData(event) {
        try {
            //console.log("loadmoreData called");
            const currentRecord = this.queryResult;
            const { target } = event;
            target.isLoading = true;
            this.targetDatatable = event.target;

            this.rowOffSet = this.rowOffSet + this.rowLimit;
            this.loadData()
                .then(()=> {
                    target.isLoading = false;
                });   
        } catch (error) {
            console.log(error);
        }
    }
    sortBy(field, reverse, primer) {
        try {
            const key = primer
            ? function(x) {
                return primer(x[field]);
            }
            : function(x) {
                return x[field];
            };
            return function(a, b) {
                a = key(a);
                b = key(b);
                return reverse * ((a > b) - (b > a));
            };
        } catch (error) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Some Problem Occured , Please Try Again.',
                message: error,
                variant: 'error',
            }));        
        }
    }
    onHandleSort(event) {
        try {
            const { fieldName: sortedBy, sortDirection } = event.detail;
            const cloneData = [...this.queryResult];
            cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
            this.queryResult = cloneData;
            this.sortDirection = sortDirection;
            this.sortedBy = sortedBy;
        } catch (error) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Some Problem Occured , Please Try Again.',
                message: error,
                variant: 'error',
            }));
        }
    }

}
