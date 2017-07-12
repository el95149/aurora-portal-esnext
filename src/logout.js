/**
 * Created by aanagnostopoulos on 10/7/2017.
 */
import {inject} from 'aurelia-dependency-injection';
import {Router} from 'aurelia-router';
import {ApplicationState} from 'application-state';

@inject(Router, ApplicationState)
export class Logout {

  constructor(router, state) {
    this.router = router;
    this.state = state;
  }

  activate(params, navigationInstruction) {
    this.state.userid = null;
    this.state.username = null;
    this.state.password = null;
    this.state.role = null;
    this.state.previousRoute = null;
  //reset navigation instructions
    for (let route of this.router.routes) {
      route.nav = false;
    }
  //clear navigation model
    this.router.navigation.splice(0);

    this.router.refreshNavigation();
    this.router.navigateToRoute('login', null, {replace: true});
  }

}
