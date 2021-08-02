import { LightningElement } from 'lwc';
import loginAccess from '@salesforce/apex/GetRecords.loginAccess';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Login extends LightningElement {
    user="";
    password="";
    loginGranted=false;
    
    handleUser(event){
        this.user=event.detail.value;
    }
    handlePassword(event){
        this.password=event.detail.value;
    }
    handleSubmit(event){
        loginAccess({username:this.user,password:this.password})
        .then(result=>{
            if(this.user===result.username && this.password===result.password){
                this.loginGranted=true;
                this.dispatchEvent(new CustomEvent("logingranted",{detail:result.value}));
            }else{
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Incorrect Username/Password',
                    message: "please check username and password. Try Again .",
                    variant: 'warning',
                }));
            }
        })
        .catch(error=>{
            console.log(error);
        });
    }
}