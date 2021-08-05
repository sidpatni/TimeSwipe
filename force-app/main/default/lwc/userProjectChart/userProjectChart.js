import { LightningElement, wire ,api} from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import updateProjectChart from '@salesforce/messageChannel/updateProjectChart__c';

export default class UserProjectChart extends LightningElement {
    query="";
    @api reloadCount=0;
    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        console.log( "connected Callback called");
        this.subscribeToMessageChannel();
    }
    renderedCallback() {
        console.log( "rendered Callback called");
        this.subscribeToMessageChannel();
    }
    subscribeToMessageChannel() {
      this.subscription = subscribe(
        this.messageContext,
        updateProjectChart,
        (message) => this.handleMessage(message)
      );
    }
    handleMessage(message) {
        try {
            if(message.query) {
                this.query=message.query;
            }
        } catch (error) {
            console.log(error);
        }
    }
    handleRefresh(event){
        console.log(this.reloadCount);
        this.subscribeToMessageChannel();

        this.reloadCount++;
    }
    get projectQuery(){
        return this.query;
    }
}