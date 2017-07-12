/**
 * Created by aanagnostopoulos on 10/7/2017.
 */
export class BaseVM {

  state = null;
  success = null;
  info = null;
  warning = null;
  danger = null;
  errors = null;
  working= false;

  clearMessages() {
    this.success = null;
    this.info = null;
    this.warning = null;
    this.danger = null;
    this.errors = null;
  }

}
