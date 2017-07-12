/**
 * Created by aanagnostopoulos on 11/7/2017.
 */
import {inject} from 'aurelia-dependency-injection';
import {DialogController} from 'aurelia-dialog';

@inject(DialogController)
export class ForgotPassword {
  email = null;

  constructor(controller) {
    this.controller = controller;
  }
}
