/**
 * Created by aanagnostopoulos on 10/7/2017.
 */
import {inject} from 'aurelia-dependency-injection';
import {DialogController} from 'aurelia-dialog';

@inject(DialogController)
export class Prompt {

  constructor(controller) {
    this.controller = controller;
  }

  activate(question) {
    this.question = question;
  }
}
