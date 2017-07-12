/**
 * Created by aanagnostopoulos on 10/7/2017.
 */
import {HttpClient} from 'aurelia-fetch-client';
import {ApplicationState} from 'application-state';
import {inject} from 'aurelia-dependency-injection';
import {Router} from 'aurelia-router';
import {RouterConfiguration} from 'aurelia-router';
import {BaseVM} from 'baseVM';
// import {Prompt} from 'prompt';
import {DialogService} from 'aurelia-dialog';
import {ForgotPassword} from 'forgotPassword';
// import {NavModel} from 'aurelia-router';
// import {RouteConfig} from 'aurelia-router';
import {Messages} from 'messages';

@inject(HttpClient, ApplicationState, Router, RouterConfiguration, DialogService)
export class Login extends BaseVM {

  email = null;
  password = null;

  constructor(http, state, router,
              config, dialogService) {
    super();
    this.http = http;
    this.state = state;
    this.router = router;
    this.config = config;
    this.dialogService = dialogService;
    http.configure(configuration => {
      configuration
        .useStandardConfiguration()
        .withBaseUrl(state.apiBaseUrl);
    });
  }

  activate(params, routeConfig) {
    //nothing to do
    if (params.signup) {
      console.log(params.signup);
      this.success = 'You have successfully signed up, you will shortly receive an activation email.';
    }
    if (params.activate) {
      console.log(params.activate);
      if (params.activate === 'true') {
        this.success = 'You have successfully activated your account!';
      } else {
        this.danger = 'There was a problem with your account activation.';
      }
    }
  }

  login() {
    this.http.fetch(this.state.apiBaseUrl + 'users/search/login?page=0&size=1&email=' + this.email + '&password=' + this.password, {
      method: 'GET'
    }).then(response =>
      response.json()).then(data => {
        let user = data._embedded.users[0];
        if (!user) {
          this.danger = 'Invalid credentials!';
          return;
        }
        this.state.userid = user.id;
        this.state.username = user.email;
        this.state.password = user.password;
        this.state.role = user.role;
      //clear all previous Navigation Models
        this.router.navigation.splice(0);

      //create Navigaton Models
      //TODO: implement RBAC
        for (let route of this.router.routes) {
          if (route.name !== 'login' && route.name !== 'signup') {
          //don't add admin specific pages to nav model, for simple users
            if (route.settings.isAdmin && this.state.role === 'USER') {
              console.log('Hiding route:' + route.name);
              continue;
            }

            route.nav = true;
            let navModel = this.router.createNavModel(route);
            this.router.navigation.push(navModel);
          }
        }
        this.router.refreshNavigation();

        let previousRoute = this.state.previousRoute;
        if (previousRoute !== null) {
          this.state.previousRoute = null;
          this.router.navigate(previousRoute);
        } else {
          this.router.navigate('pydap');
        }
      })
      .catch(error => {
        console.log(error);
        console.log(error.status);
        this.danger = Messages.SERVER_ERROR;
      });
  }

  signup() {
    this.router.navigate('signup');
  }

  forgotPassword() {
    this.dialogService.open({viewModel: ForgotPassword, model: 'Good or Bad?', lock: false}).whenClosed(response => {
      if (!response.wasCancelled) {
        this.http.fetch('user/forgotPassword?email=' + response.output, {
          method: 'get'
        }).then(resp =>
          resp.json()).then(data => {
            let message = data;
            console.log(message);
            this.danger = null;
            this.success = message.message;
          })
          .catch(error => {
            console.log(error.status);
            this.danger = 'Error sending password!';
          });
      }
    });
  }
}
