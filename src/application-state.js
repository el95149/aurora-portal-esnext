/**
 * Created by aanagnostopoulos on 10/7/2017.
 */
export class ApplicationState {

  // private _apiBaseUrl = "http://10.0.0.146:8080/aurora/api/";

  _apiBaseUrl = 'http://www.ilabsse.gr:8080/aurora/api/';

  // private _apiBaseUrl = "http://localhost:8080/aurora/api/";

  // private _ncWMSUrl = "http://10.0.0.146:8080/ncWMS2/";

  // _ncWMSUrl = 'http://www.ilabsse.gr:8080/ncWMS2/';

  _ncWMSUrl = 'http://localhost:8080/ncWMS2/';

  static _notSpecified = '(--Not Specified--)';

  _previousRoute = null;

  _userid = null;
  _username = null;
  _password = null;
  _role = null;

  get apiBaseUrl() {
    return this._apiBaseUrl;
  }

  get CredentialsEncoded() {
    return Base64.encode(this._username + ':' + this._password);
  }

  get DefaultHeaders() {
    return null;
  }

  static get notSpecified() {
    return this._notSpecified;
  }

  static set notSpecified(value) {
    this._notSpecified = value;
  }

  get role() {
    return this._role;
  }

  set role(value) {
    this._role = value;
  }

  get userid() {
    return this._userid;
  }

  set userid(value) {
    this._userid = value;
  }

  get username() {
    return this._username;
  }

  set username(value) {
    this._username = value;
  }

  get password() {
    return this._password;
  }

  set password(value) {
    this._password = value;
  }


  get previousRoute() {
    return this._previousRoute;
  }

  set previousRoute(value) {
    this._previousRoute = value;
  }

  get ncWMSUrl() {
    return this._ncWMSUrl;
  }

  set ncWMSUrl(value) {
    this._ncWMSUrl = value;
  }

}
