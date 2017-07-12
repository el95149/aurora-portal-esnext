/**
 * Created by aanagnostopoulos on 10/7/2017.
 */
import {Messages} from 'messages';
import $ from 'jquery';
import {ApplicationState} from './application-state';

export class Util {

  static createEvent(name) {
    let event = document.createEvent('Event');
    event.initEvent(name, true, true);
    return event;
  }

  static fireEvent(element, name) {
    let event = this.createEvent(name);
    element.dispatchEvent(event);
  }

  static substringMatcher(strs) {
    return function findMatches(q, cb) {
      let matches;
      // let substringRegex;

      // an array that will be populated with substring matches
      matches = [];

      // regex used to determine if a string contains the substring `q`
      let substrRegex = new RegExp(q, 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function (i, str) {
        if (substrRegex.test(str)) {
          matches.push(str);
        }
      });
      cb(matches);
    };
  }

  static getGenders() {
    return [
      {value: null, name: ApplicationState.not_specified},
      {value: 'FEMALE', name: 'Female'},
      {value: 'MALE', name: 'Male'}
    ];
  }

  static parseError(errorAsJson) {
    if (errorAsJson.hasOwnProperty('error')) {
      return errorAsJson.error === null ? Messages.SERVER_ERROR : errorAsJson.error;
    }
    return null;
  }

  static parseValidationErrors(errorAsJson) {
    let errors = [];
    //parse global errors (if any)
    if (errorAsJson.hasOwnProperty('global')) {
      let global = errorAsJson.global;
      errors = global;
    }
    //parse field errors (if any)
    for (let key in errorAsJson) {
      if (key !== 'global' && errorAsJson.hasOwnProperty(key)) {
        let fieldErrors = errorAsJson[key];
        for (let fieldError of fieldErrors) {
          errors.push(key + ': ' + fieldError);
        }
      }
    }
    console.log(errors);
    return errors;
  }
}
