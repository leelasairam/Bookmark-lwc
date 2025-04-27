import { LightningElement, wire,api } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { CloseActionScreenEvent } from "lightning/actions";
import insertBookmark from '@salesforce/apex/bookmarkController.insertBookmark';

export default class BookmarkForm extends LightningElement {
    @api recordId;
    loading = false;
    async createBookMark(){
        this.loading= true;
        console.log(this.recordId,"$recordId");
        const notes = this.template.querySelector('.form-notes').value;
        try{
            const result = await insertBookmark({recordId:this.recordId,notes:notes});
            this.dispatchEvent(new CloseActionScreenEvent());
            this.toast('Bookmarked successfully','','success');
        }
        catch(error){
            this.dispatchEvent(new CloseActionScreenEvent());
            this.toast(error.body.message,'','info');
            console.log(error);
        }
        this.loading = false;
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
}
