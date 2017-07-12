/**
 * Created by aanagnostopoulos on 12/7/2017.
 */
/**
 * Created by aanagnostopoulos on 1/11/16.
 */
import {inject} from 'aurelia-dependency-injection';
import {DialogController} from 'aurelia-dialog';
import {HttpClient, json} from 'aurelia-fetch-client';
import {ApplicationState} from './application-state';
// import {Validation} from 'aurelia-validation';
// import {ensure} from 'aurelia-validation';
import {Messages} from './messages';
import {Util} from './util';
import {BaseVM} from './baseVM';
import {DialogService} from 'aurelia-dialog';
import {Prompt} from './prompt';
import $ from 'jquery';

@inject(DialogController, HttpClient, ApplicationState, DialogService)
export class User extends BaseVM {
  user = null;
  // countries:Country[] = null;
  genders = null;
  roles = ['USER', 'ADMIN'];
  error = null;

  constructor(controller, http, state, dialogService) {
    super();
    this.controller = controller;
    this.http = http;
    this.state = state;
    this.dialogService = dialogService;
    this.http.configure(config => {
      config
        .useStandardConfiguration()
        .withBaseUrl(state.apiBaseUrl).withDefaults({
          headers: {
            'Content-Type': 'application/json'
          // ,'Authorization': 'Basic ' + this.state.CredentialsEncoded
          }
        });
    });
// this.validation = valid.on(this, null);
// this.validation = this.validation.ensure('user.email').isNotEmpty().isEmail();
// this.validation = this.validation.ensure('user.firstname').isNotEmpty().hasMaxLength(80);
// this.validation = this.validation.ensure('user.lastname').isNotEmpty().hasMaxLength(80);
// this.validation = this.validation.ensure('user.organization').hasMaxLength(255);
  }

  activate(id) {
    console.log('user id passed:', id);
    if (id !== null) {
      this.http.fetch('users/' + id).then(response => response.json()).then(user => {
        console.log(user);
        this.user = user;
      });
    } else {
      this.user = {};
      this.user.isActive = true;
    }

    this.genders = Util.getGenders();
  }

  save() {
    //TODO: remove this check once Aurelia supports setting members to null
    if (this.user.country && this.user.country !== null && this.user.country.countryId === null) {
      this.user.country = null;
    }

    // this.validation.validate().then(() => {

    //create a shallow copy of the user, for property fine-tuning before sending to the CAI
    let tempUser = $.extend({}, this.user);

    let now = new Date();  //TODO: delegate to server side
    tempUser.updateDate = now;
    if (!this.user.id) {
      //new user, create
      tempUser.createDate = now;
      console.log(tempUser);
      this.http.fetch('users', {
        method: 'POST',
        body: json(tempUser)
      }).then(response => response.json()).then(user => {
        this.clearMessages();
        this.controller.ok(user);
      }).catch(error => {
        console.log(error);
        if (error.status === 422) {
          return error.json();
        }
        this.clearMessages();
        this.danger = Messages.SERVER_ERROR;
        return null;
      }).then(errorDetails => {
        if (errorDetails) {
          this.errors = Util.parseValidationErrors(errorDetails);
        }
      });
    } else {
      console.log(tempUser);
      //existing user, update
      this.http.fetch('users/' + this.user.id, {
        method: 'PATCH',
        body: json(tempUser)
      }).then(response => response.json()).then(user => {
        this.clearMessages();
        this.controller.ok(user);
      }).catch(error => {
        console.log(error);
        if (error.status === 422) {
          return error.json();
        }
        this.clearMessages();
        this.danger = Messages.SERVER_ERROR;
        return null;
      }).then(errorDetails => {
        if (errorDetails) {
          this.errors = Util.parseValidationErrors(errorDetails);
        }
      });
    }
    // });
  }

  delete() {
    this.dialogService.open({viewModel: Prompt, model: 'Really delete?'}).whenClosed(response => {
      if (response.wasCancelled) {
        return;
      }
      //delete user
      this.http.fetch('users/' + this.user.id, {
        method: 'DELETE',
        body: json(this.user)
      }).then(resp => resp.text())
        .then(data => {
          console.log(data);
          this.controller.ok();
        })
        .catch(error => {
          console.log(error);
          this.danger = Messages.SERVER_ERROR;
          return null;
        });
    });
  }
}
