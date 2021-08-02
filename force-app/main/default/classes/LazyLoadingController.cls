/**
 * @description       : 
 * @author            : Siddharth Patni
 * @group             : 
 * @last modified on  : 07-28-2021
 * @last modified by  : Siddharth Patni
**/
public with sharing class LazyLoadingController {
    @AuraEnabled
    public static List<Time_Log__c> getLogs(Integer limitSize, Integer offset,String user){
        List<Time_Log__c> logList = [SELECT Id,Name,Project__r.Name,Task__r.Name,Task__c,Date__c,Hours__c,Minutes__c,Billable__c,Description__C
                                     FROM Time_Log__c
                                     WHERE User__c = :user
                                     ORDER BY Name DESC
                                     LIMIT :limitSize
                                     OFFSET :offset
                                     ];
        System.debug('getLogs called :'+logList.size());
        return logList;
    }
}