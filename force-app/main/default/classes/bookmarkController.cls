public class bookmarkController {
    
    public static String getObjName(String recordId){
        Schema.SObjectType objType = Id.valueOf(recordId).getSObjectType();
        Schema.DescribeSObjectResult describeResult = objType.getDescribe();
        return describeResult.getLabel();//returns object name
    }
    
    @AuraEnabled
    public static void insertBookmark(String recordId,String notes){
        if(recordId!=null && recordId.length()>=15 && recordId.length()<=18){
            Id uid = UserInfo.getUserId();
            Integer count = [SELECT count() FROM Bookmark__c WHERE OwnerId =:uid AND Name = :recordId];
            if(count==0){
                String recordType = getObjName(recordId);//Object Name
                Bookmark__c BM = new Bookmark__c();
                BM.Name = recordId;
                BM.Record_Type__c = recordType;
                BM.Record_Label__c = getRecordLabel(recordType,recordId);
                BM.Notes__c = notes;
                try{
                   insert BM; 
                }
                catch(Exception e){
                    throw new AuraHandledException(e.getMessage());
                }
         
            }
            else{
                throw new DmlException('This record was already bookmarked.');
            }
        }
    }
    
    public static String getRecordLabel(String recordType,String recordId){
        String returnValue;
        switch on recordType{
            when 'Account'{
                returnValue = [SELECT Id,Name FROM Account WHERE Id=:recordId].Name;
            }
            when 'Contact'{
                returnValue = [SELECT Id,Name FROM Contact WHERE Id=:recordId].Name;
            }
            when 'Case'{
                returnValue = [SELECT Id,CaseNumber FROM Case WHERE Id=:recordId].CaseNumber;
            }
        }
        return returnValue;
    }
    
    @AuraEnabled
    public static list<Bookmark__c>getBookmarks(String filter){
        Id uid = UserInfo.getUserId();
        system.debug(filter);
        if(filter=='none'){
             return [SELECT Id,Name, Notes__c,Record_Label__c, Record_Type__c, Record_Url__c,  Owner.Name,CreatedDate , Pinned__c FROM Bookmark__c WHERE OwnerId =:uid ORDER BY Pinned__c DESC,CreatedDate DESC];
        }
        else{
             return [SELECT Id,Name, Notes__c,Record_Label__c, Record_Type__c, Record_Url__c,  Owner.Name,CreatedDate , Pinned__c FROM Bookmark__c WHERE OwnerId =:uid AND Record_Type__c=:filter ORDER BY Pinned__c DESC,CreatedDate DESC];
        }
    }
    
    @AuraEnabled
    public static void deleteBookmark(String bookmarkId){
        Bookmark__c BM = new Bookmark__c();
        BM.Id = bookmarkId;
        try{
            delete BM;
        }
        catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void pinBookmark(String bookmarkId,Boolean isUnPin){
        Bookmark__c BM = new Bookmark__c();
        BM.Id = bookmarkId;
        BM.Pinned__c = !isUnPin ? true : false;
        try{
            update BM;        
        }
        catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }
}