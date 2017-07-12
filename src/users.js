/**
 * Created by aanagnostopoulos on 12/7/2017.
 */
import {inject} from 'aurelia-dependency-injection';
import {HttpClient} from 'aurelia-fetch-client';
import 'fetch';
import {ApplicationState} from './application-state';
import {DialogService} from 'aurelia-dialog';
import {User} from './user';
import {BaseVM} from './baseVM';
import {Messages} from './messages';
// import {Prompt} from './prompt';


@inject(HttpClient, ApplicationState, DialogService)
export class Users extends BaseVM {
  heading = 'Users';
  users = [];
  pageSize = 5;
  pageSizes = [5, 10, 20];
  currentPage = 1;

  constructor(http, state, dialogService) {
    super();
    this.http = http;
    this.state = state;
    this.dialogService = dialogService;
    this.http.configure(config => {
      config
        .useStandardConfiguration()
        .withBaseUrl(state.apiBaseUrl).withDefaults({
          headers: {
            'Content-Type': 'application/json'
          }
        });
    });
  }

  refreshUsers() {
    return this.http.fetch('users?size=1000')
      .then(response => response.json()).then(data => {
        this.users = data._embedded.users;
      });
  }

  activate() {
    this.refreshUsers();
  }

  rowSelected(event) {
    console.log(event.detail.row.id);
    this.dialogService.open({viewModel: User, model: event.detail.row.id, lock: false}).whenClosed(response => {
      if (!response.wasCancelled) {
        console.log('good - ', response.output);
        this.refreshUsers();
        this.success = Messages.SUCCESS;
      }
    });
  }

  addUser() {
    this.dialogService.open({viewModel: User, model: null, lock: false}).whenClosed(response => {
      if (!response.wasCancelled) {
        console.log('good - ', response.output);
        this.refreshUsers();
        this.success = Messages.SUCCESS;
      }
    });
  }

}
