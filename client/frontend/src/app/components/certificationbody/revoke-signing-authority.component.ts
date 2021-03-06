import { Component }    from '@angular/core';
import { AppComponent } from "../../app.component";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";
import {Accreditation, Authorization, Message} from "../../types";

@Component({
  moduleId: module.id,
  selector: 'revoke-signing-authority',
  templateUrl: 'revoke-signing-authority.component.html'
})
export class RevokeSigningAuthorityComponent extends AppComponent {
  private authorizations:Authorization[];
  private revocation_timestamp:string;
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  OnInitialized():void {
    this.revocation_timestamp = new Date().toISOString();

    // get issued authorizations
    this.chainService.get_issued_authorizations(this.enrolledId).then(result => {
      let auths:Authorization[] = result as Authorization[];

      if(auths && auths.length > 0){
        this.authorizations = auths.filter(
          auth => !auth.Revoked
        );
      }

      if(this.authorizations){
        this.authorizations.forEach((auth,idx) => {
          this.chainService.get_accreditation(auth.AccreditationID).then(result => {
            this.authorizations[idx].Accreditation = result as Accreditation;
          });
        });
      }

      if(!this.authorizations || (this.authorizations && this.authorizations.length == 0)) {
        this.msg = {text:"No authorizations found", level:"alert-info"}
      }
    });
  }

  revoke_authorization(authorizationIdx:number,timestamp:string):void {

    this.msg = {text:"Revoking signing authorization..",level:"alert-info"};
    this.chainService.revoke_signing_authority(this.authorizations[authorizationIdx].AccreditationID,this.authorizations[authorizationIdx].AuthorizedParty,timestamp).then(result => {

      this.msg = {text:result,level:"alert-success"};
    }).catch(reason => {
      this.msg = {text:reason.toString(),level:"alert-danger"};
    });
  }
}
