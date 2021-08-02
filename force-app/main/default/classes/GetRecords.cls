/**
 * @description       : 
 * @author            : Siddharth Patni
 * @group             : 
 * @last modified on  : 07-21-2021
 * @last modified by  : Siddharth Patni
 * Modifications Log 
 * Ver   Date         Author            Modification
 * 1.0   07-20-2021   Siddharth Patni   Initial Version
**/
public with sharing class GetRecords {
    @AuraEnabled(cacheable=true)
    public static List<GetRecords.Wrapper> getUsers(){
        try{
            List<user__c> usrList=[SELECT Name,Id FROM user__c ] ;
            List<Wrapper> wrapperList = new List<Wrapper>();
            for(user__c usrObject:usrList){
                Wrapper wr=new Wrapper();
                wr.label=usrObject.name;
                wr.value=usrObject.Id;
                wrapperList.add(wr);
            }
            System.debug(wrapperList);
            return wrapperList;
        }catch(Exception e){
            System.debug(e);
        }
        return null;

    }
    @AuraEnabled(cacheable=true)
    public static List<GetRecords.Wrapper> getTasksByProject(String project){
        try {
            List<Task__c> taskList=[SELECT Name,Id FROM Task__c where project__c =:project] ;
            List<Wrapper> wrapperList = new List<Wrapper>();
            for(Task__c taskObject:taskList){
                Wrapper wr=new Wrapper();
                wr.label=taskObject.name;
                wr.value=taskObject.id;
                wrapperList.add(wr);
            }
            System.debug(wrapperList);

            return wrapperList;
        } catch (Exception e) {
            System.debug(e);
        }     
        return null;

    }
    
    @AuraEnabled(cacheable=true)
    public static List<GetRecords.Wrapper> getProjectsByUser(String user){
        try {
            List<Project__c> projectList=[SELECT Name,Id FROM Project__c where id in (Select project__c from userToProject__c where user__c = :user ) ] ;
            List<Wrapper> wrapperList = new List<Wrapper>();
            for(Project__c projectObject:projectList){
                Wrapper wr=new Wrapper();
                wr.label=projectObject.name;
                wr.value=projectObject.id;
                wrapperList.add(wr);
            }
            System.debug(wrapperList);

            return wrapperList;
        } catch (Exception e) {
            System.debug(e);
        }
        return null;
    }
    @AuraEnabled(cacheable=true)
    public static GetRecords.Wrapper loginAccess(String username,string password){
        try {
            Wrapper wrap=new Wrapper();
            System.debug('username '+username+' password '+password);
			List<user__c> userlst=[SELECT Name,Id,Username__c,Password__C FROM User__c WHERE Username__c=:username AND Password__c=:password];
            if(userlst.size()>0){
                System.debug('user :'+userlst[0].username__c+' password :'+userlst[0].password__c);
                wrap.username=userlst[0].username__c;
                wrap.password=userlst[0].password__c;
                wrap.value=userlst[0].Id;
            }else{
                System.debug('no data found');
            }
            return wrap;
        } catch (Exception e) {
            System.debug(e);
            Wrapper wrap=new Wrapper();
            wrap.username='';
            wrap.password='';
            return wrap;
        }
    }
    public class Wrapper{
        @AuraEnabled
        public String label {get; set;}
        @AuraEnabled
        public String value {get; set;}
        @AuraEnabled
        public String username {get; set;}
        @AuraEnabled
        public String password {get; set;}
    }
    
}