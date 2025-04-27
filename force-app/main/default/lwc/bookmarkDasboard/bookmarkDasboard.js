import { LightningElement,track } from 'lwc';
import getBookmarks from '@salesforce/apex/bookmarkController.getBookmarks';
import deleteBookmark from '@salesforce/apex/bookmarkController.deleteBookmark';
import pinBookmark from '@salesforce/apex/bookmarkController.pinBookmark';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
export default class BookmarkDasboard extends LightningElement {
    @track bookmarks=[];
    filter = 'none';
    loading = false;
    objectOptions = [
        { label: 'None', value: 'none' },
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Case', value: 'Case' },
    ]
    cols = [
        { label: 'Name', fieldName: 'Record_Url__c', type: 'url',
            typeAttributes: { label: { fieldName: 'Record_Label__c' }, target: '_blank' }
        },
        { label: 'Object', fieldName: 'Record_Type__c', type: 'text' },
        { label: 'Created', fieldName: 'CreatedDate', type: 'date' },
        { label: 'Notes', fieldName: 'Notes__c', type: 'text' },
        {
            type: "button", label: 'Pin/Unpin', initialWidth: 100, typeAttributes: {
                name: 'pin/unpin',
                title: { fieldName: 'pinButtonName' },
                disabled: false,
                value: 'pin',
                iconPosition: 'left',
                iconName:{ fieldName: 'pinBtnLabel' },
                variant:{ fieldName: 'pinVarient' },
            }
        },
        {
            type: "button", label: 'Delete', initialWidth: 100, typeAttributes: {
                name: 'delete',
                title: 'delete',
                disabled: false,
                value: 'delete',
                iconPosition: 'left',
                iconName:'utility:delete',
                variant:'destructive-text'
            }
        },
        { label: 'Id', fieldName: 'Id', type: 'text', hideDefaultActions: true, fixedWidth: 1 },
        { label: 'btnAction', fieldName: 'pinButtonName', type: 'text', hideDefaultActions: true, fixedWidth: 1 },
    ]

    connectedCallback(){
        this.fetchBookmarks();
    }

    toast(title,msg,varient){
        this.dispatchEvent(
            new ShowToastEvent({
              title: title,
              message: msg,
              variant: varient,
            }),
          );
    }

    async handleObjectChange(event){
        this.filter = event.detail.value;
        console.log(this.filter);
        this.fetchBookmarks();
    }

    fetchBookmarks(){
        this.loading=true;
        console.log(this.filter);
        getBookmarks({filter:this.filter})
        .then(result=>{
            const temp = result.map(bookmark=>({...bookmark,
                pinBtnLabel:!bookmark.Pinned__c ? 'utility:pinned' : 'utility:detach',
                pinVarient:!bookmark.Pinned__c ? 'neutral' : 'brand',
                pinButtonName:bookmark.Pinned__c ? 'unpin' : 'pin'
            }))
            this.bookmarks = temp;
        })
        .catch(error=>{
            console.log(error);
        })
        .finally(()=>{
            this.loading=false;
        })
    }

    async removeBookmark(rowId){
        this.loading = true;
        try{
            const result = await deleteBookmark({bookmarkId:rowId});
            this.toast('Deleted successfully','','success');
        }
        catch(error){
            console.log(error);
            this.toast('Error',error.body.message,'error');
        }
        finally{
            this.fetchBookmarks();
            this.loading = false;
        }
    }

    async handlePinAction(rowId,action){
        this.loading = true;
        try{
            const actionPin = action==='unpin' ? true : false;
            const result = await pinBookmark({bookmarkId:rowId,isUnPin:actionPin});
            this.toast(`${actionPin ? 'Unpinned' : 'Pinned'} successfully`,'','success');
        }
        catch(error){
            console.log(error);
            this.toast('Error',error.body.message,'error');
        }
        finally{
            this.fetchBookmarks();
            this.loading = false;
        }
    }

    handleRowAction(event){
        const row = event.detail.row;
        const actionName = event.detail.action.name;
        console.log(row.Id,actionName);
        if(actionName==='delete'){
            this.removeBookmark(row.Id);
        }
        else if(actionName==='pin/unpin'){
            //console.log(row.pinButtonName);
            this.handlePinAction(row.Id,row.pinButtonName);
        }
    }

    refreshBookmarks(){
        this.fetchBookmarks();
    }
}