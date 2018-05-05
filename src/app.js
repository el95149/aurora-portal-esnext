import {HttpClient} from 'aurelia-fetch-client';
import {ApplicationState} from 'application-state';
import {inject} from 'aurelia-dependency-injection';
import {Router, Redirect} from 'aurelia-router';

export class App {
  configureRouter(config, router) {
    config.title = 'AURORA outer portal';

    config.addPipelineStep('authorize', AuthorizeStep);
    config.map([
      // {route: ['', 'login'], name: 'login', moduleId: 'login', nav: false, title: 'Login'},
      // {route: 'logout', name: 'logout', moduleId: 'logout', nav: false, title: 'Logo@ut'},
      // {route: 'users', name: 'users', moduleId: 'users', nav: true, title: 'Users', settings:{auth: true, isAdmin: true}},
      {route: ['', 'pydap'], name: 'pydap', moduleId: 'pydap', nav: true, title: 'Pydap WMS', settings: {auth: false}}
      // { route: ['', 'welcome'], name: 'welcome',      moduleId: 'welcome',      nav: true, title: 'Welcome' },
      // { route: 'child-router',  name: 'child-router', moduleId: 'child-router', nav: true, title: 'Child Router' }
    ]);

    this.router = router;
  }
}
@inject(ApplicationState, HttpClient, Router)
class AuthorizeStep {

  constructor(state, http, router) {
    this.state = state;
    this.http = http;
    this.router = router;
  }

  run(navigationInstruction, next) {
    if (navigationInstruction.getAllInstructions().some(i => i.config.settings.auth)) {
      let isLoggedIn = (this.state.username !== null);
      let isUserAllowed = (navigationInstruction.config.settings.isAdmin && this.state.role === 'USER') ? false : true;

      if (!isLoggedIn || !isUserAllowed) {
        this.state.previousRoute = navigationInstruction.config.moduleId;
    //re-initialize the http client. For some reason it holds on to the settings set by the 'previousRoute' VM
        this.http.configure(config => {
          config
        .useStandardConfiguration()
        .withBaseUrl(this.state.apiBaseUrl);
        });
        return next.cancel(new Redirect('login'));
      }
    }
    if (this.router.navigation.length > 0) {
      for (let navModel of this.router.navigation) {
        if (navModel.config.name === navigationInstruction.config.name) {
          navModel.isActive = true;
        } else {
          navModel.isActive = false;
        }
      }
    }
    return next();
  }
}
