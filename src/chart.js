import {inject} from 'aurelia-dependency-injection';
import {DialogController} from 'aurelia-dialog';
import {ApplicationState} from './application-state';
import {BaseVM} from './baseVM';
import {DialogService} from 'aurelia-dialog';

@inject(DialogController, ApplicationState, DialogService)
export class Chart extends BaseVM {
  x = null;
  y = null;
  chart = null;
  error = null;

  constructor(controller, state, dialogService) {
    super();
    this.controller = controller;
    // controller.settings.host = 'wrapper';
    this.state = state;
    this.dialogService = dialogService;
  }

  activate(chart) {
    // console.log(Math.round(chart.pixel[0]), Math.round(chart.pixel[1]));
    console.log(Math.trunc(chart.pixel[0]), Math.trunc(chart.pixel[1]));
    this.chart = this.state.ncWMSUrl + 'wms?REQUEST=GetVerticalProfile' +
      '&LAYERS=' + chart.layer +
      '&QUERY_LAYERS=' + chart.layer +
      '&BBOX=' + chart.extent[0] + ',' + chart.extent[1] + ',' + chart.extent[2] + ',' + chart.extent[3] +
      '&SRS=CRS:84' +
      '&FEATURE_COUNT=5' +
      '&HEIGHT=' + chart.mapSize[1] +
      '&WIDTH=' + chart.mapSize[0] +
      '&X=' + Math.trunc(chart.pixel[0]) +
      '&Y=' + Math.trunc(chart.pixel[1]) +
      // '&X=' + Math.round(chart.pixel[0]) +
      // '&Y=' + Math.round(chart.pixel[1]) +
      '&STYLES=default/default' +
      '&TIME=' + chart.time +
      '&VERSION=1.1.1&INFO_FORMAT=image/png';

    window.open(this.state.ncWMSUrl + 'wms?' +
      '&LAYERS=' + chart.layer +
      '&QUERY_LAYERS=' + chart.layer +
      '&STYLES=default-scalar%2Fdefault' +
      '&SERVICE=WMS' +
      '&VERSION=1.1.1' +
      '&REQUEST=GetFeatureInfo' +
      '&BBOX=' + chart.extent[0] + ',' + chart.extent[1] + ',' + chart.extent[2] + ',' + chart.extent[3] +
      '&FEATURE_COUNT=5' +
      '&HEIGHT=' + chart.mapSize[1] +
      '&WIDTH=' + chart.mapSize[0] +
      '&X=' + Math.trunc(chart.pixel[0]) +
      '&Y=' + Math.trunc(chart.pixel[1]) +
      // '&X=' + Math.round(chart.pixel[0]) +
      // '&Y=' + Math.round(chart.pixel[1]) +
      '&FORMAT=image%2Fpng' +
      '&INFO_FORMAT=text%2Fxml' +
      '&SRS=CRS:84' +
      '&TIME=' + chart.time +
      '&ELEVATION=1');
  }

  download() {
    console.log('download');
  }
}
