/**
 * Created by aanagnostopoulos on 11/7/2017.
 */
import {layer, Map, Overlay, source, View, proj, format, Attribution, control, interaction} from 'openlayers';
import {inject} from 'aurelia-dependency-injection';
import {Messages} from './messages';
import {HttpClient} from 'aurelia-fetch-client';
import {ApplicationState} from './application-state';
import {BaseVM} from './baseVM';
import {TaskQueue} from 'aurelia-framework';
import 'jquery';
import moment from 'moment';
import {saveAs} from 'file-saver';
import {computedFrom} from 'aurelia-framework';

// import Control = ol.control.Control;


@inject(HttpClient, ApplicationState, TaskQueue)
export class Pydap extends BaseVM {

  static get ZOOM_LEVEL_DEFAULT() {
    return 4;
  }

  styles = ['default',
    'default-inv',
    'div-BrBG',
    'div-BrBG-inv',
    'div-BuRd',
    'div-BuRd-inv',
    'div-BuRd2',
    'div-BuRd2-inv',
    'div-PRGn',
    'div-PRGn-inv',
    'div-PiYG',
    'div-PiYG-inv',
    'div-PuOr',
    'div-PuOr-inv',
    'div-RdBu',
    'div-RdBu-inv',
    'div-RdGy',
    'div-RdGy-inv',
    'div-RdYlBu',
    'div-RdYlBu-inv',
    'div-RdYlGn',
    'div-RdYlGn-inv',
    'div-Spectral',
    'div-Spectral-inv',
    'psu-inferno',
    'psu-inferno-inv',
    'psu-magma',
    'psu-magma-inv',
    'psu-plasma',
    'psu-plasma-inv',
    'psu-viridis',
    'psu-viridis-inv',
    'seq-BkBu',
    'seq-BkBu-inv',
    'seq-BkGn',
    'seq-BkGn-inv',
    'seq-BkRd',
    'seq-BkRd-inv',
    'seq-BkYl',
    'seq-BkYl-inv',
    'seq-BlueHeat',
    'seq-BlueHeat-inv',
    'seq-Blues',
    'seq-Blues-inv',
    'seq-BuGn',
    'seq-BuGn-inv',
    'seq-BuPu',
    'seq-BuPu-inv',
    'seq-BuYl',
    'seq-BuYl-inv',
    'seq-GnBu',
    'seq-GnBu-inv',
    'seq-Greens',
    'seq-Greens-inv',
    'seq-Greys',
    'seq-Greys-inv',
    'seq-GreysRev',
    'seq-GreysRev-inv',
    'seq-Heat',
    'seq-Heat-inv',
    'seq-OrRd',
    'seq-OrRd-inv',
    'seq-Oranges',
    'seq-Oranges-inv',
    'seq-PuBu',
    'seq-PuBu-inv',
    'seq-PuBuGn',
    'seq-PuBuGn-inv',
    'seq-PuRd',
    'seq-PuRd-inv',
    'seq-Purples',
    'seq-Purples-inv',
    'seq-RdPu',
    'seq-RdPu-inv',
    'seq-Reds',
    'seq-Reds-inv',
    'seq-YlGn',
    'seq-YlGn-inv',
    'seq-YlGnBu',
    'seq-YlGnBu-inv',
    'seq-YlOrBr',
    'seq-YlOrBr-inv',
    'seq-YlOrRd',
    'seq-YlOrRd-inv',
    'seq-cubeYF',
    'seq-cubeYF-inv',
    'x-Ncview',
    'x-Ncview-inv',
    'x-Occam',
    'x-Occam-inv',
    'x-Rainbow',
    'x-Rainbow-inv',
    'x-Sst',
    'x-Sst-inv']
  actionButtons = ['close', 'collapsible', 'maximize', 'minimize', 'pin']
  dialogPosition = {X: 100, Y: 10}
  dateValue
  minDate
  maxDate
  interval
  map = null
  fields
  filterType
  dataManager
  query
  vectorLayer = null
  popupElement = null
  popupOverlay = null
  startLonLat = Messages.COORDINATES_EUROPE_CENTER
  baseLayer
  datasets = []
  selectedDataset = null
  layers = []
  selectedLayers = []
  menuDisplayed = true
  source = null
  boundingBoxPresent = false

  constructor(http, state, taskQueue) {
    super();
    this.http = http;
    this.state = state;
    this.taskQueue = taskQueue;

    http.configure(config => {
      config
        .useStandardConfiguration();
    });

//get ncWMS capabilities
    fetch(this.state.ncWMSUrl + 'wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0').then(response => response.text())
      .then(text => {
        let parser = new format.WMSCapabilities();
        let result = parser.read(text);
        // console.log(JSON.stringify(result, null, 2));
        this.datasets = result.Capability.Layer.Layer;
        this.selectedDataset = this.datasets ? this.datasets[0] : null;
        this.layers = this.selectedDataset ? this.selectedDataset.Layer : undefined;
        //get time info
        if (this.layers) {
          this.updateTimeInfo();
        }
        // $("#datepick").ejDateTimePicker({value: this.dateValue});
      })
      .catch(error => {
        console.error(error);
      });
  }

  attached() {
    console.log('attached');
    this.source = new source.Vector({wrapX: false});
    this.vectorLayer = new layer.Vector({
      source: this.source
    });
    this.popupElement = document.getElementById('popup');
    this.popupOverlay = new Overlay({
      element: this.popupElement,
      //positioning: 'center-center',
      stopEvent: false
    });


    // initialize map
    this.baseLayer = new layer.Tile({
      // opacity: 0.5,
      source: new source.XYZ({
        url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
        wrapX: false,
        crossOrigin: 'anonymous'
      })
    });

    this.map = new Map({
      controls: [],
      target: 'map',
      layers: [
        this.baseLayer,
        this.vectorLayer
      ],
      //overlays: [this.popupOverlay],
      view: new View({
        center: proj.fromLonLat(this.startLonLat, 'EPSG:3857'),
        zoom: Pydap.ZOOM_LEVEL_DEFAULT
      })
    });
    this.map.addControl(new control.Attribution({collapsed: false}));
    let exportPNGElement = document.getElementById('export-png');
    // exportPNGElement.href = 'javascript:void(0)';

    exportPNGElement.addEventListener('click', e => {
      this.map.once('postcompose', event => {
        let canvas = event.context.canvas;
        console.log('setting href');
        // exportPNGElement.href = canvas.toDataURL('image/png');
        canvas.toBlob(blob => {
          saveAs(blob, 'map.png');
        });
      });
      this.map.renderSync();
    }, false);

    // let dragBox = new interaction.DragBox({
    //   condition: events.condition.platformModifierKeyOnly
    // });
    let _self = this;
    // dragBox.on('boxend', function() {
    //   // Your stuff when the box is already drawn
    //   let extent = dragBox.getGeometry().getExtent();
    //   console.log(extent);
    //   _self.map.getView().fit(dragBox.getGeometry(), _self.map.getSize());
    // });
    // this.map.addInteraction(dragBox);

    let draw = new interaction.Draw({
      source: this.source,
      type: 'Circle',
      geometryFunction: interaction.Draw.createBox()
    });
    draw.on('drawend', function(e) {
      // Your stuff when the box is already drawn
      // clear any previously drawn boxes
      _self.boundingBoxPresent = true;
      _self.source.clear();
      _self.selectedLayers.forEach(function(selectedLayer) {
        _self.map.getLayers().forEach(mapLayer => {
          let layerName = mapLayer.get('name');
          if (selectedLayer.Name === layerName) {
            mapLayer.setExtent(e.feature.getGeometry().getExtent());
          }
        });
        // selectedLayer.setExtent(e.feature.getGeometry().getExtent());
      });
      _self.map.getView().fit(e.feature.getGeometry(), _self.map.getSize());
    });

    this.map.addInteraction(draw);

    $('#btnOpen').hide();
  }

  exportImage() {
    console.log('click');
    let exportPNGElement = document.getElementById('export-png');
    // var canvas:any = document.getElementsByTagName('canvas')[0];
    this.map.once('postcompose', function(event) {
      let canvas = event.context.canvas;
      exportPNGElement.href = canvas.toDataURL('image/png');
      // console.log(canvas.toDataURL('image/png'));
    });
    this.map.renderSync();
    // console.log('click');
    // var canvas:any = document.getElementsByTagName('canvas')[0];
    // canvas.toBlob(function (blob) {
    //   window.saveAs(blob, 'map.png');
    // });
  }

  updateTimeInfo() {
    let timeDimension = this.layers[0].Dimension[0];
    let values = timeDimension.values;
    let minDateAsString = values.substring(0, values.indexOf('/'));
    let maxDateAsString = values.substring(values.indexOf('/') + 1, values.lastIndexOf('/'));
    let intervalAsString = values.substring(values.lastIndexOf('/PT') + 3, values.length);
    if (intervalAsString.endsWith('H')) {
      this.interval = parseInt(intervalAsString.substring(0, intervalAsString.length - 1), 10) * 60;
    } else if (intervalAsString.endsWith('M')) {
      this.interval = parseInt(intervalAsString.substring(0, intervalAsString.length - 1), 10);
    }
    console.log('Interval as String:' + intervalAsString);
    console.log('Interval:' + this.interval);
    this.minDate = moment(minDateAsString).format('DD/MM/YYYY HH:mm');
    this.maxDate = moment(maxDateAsString).format('DD/MM/YYYY HH:mm');
    console.log('Min Date:' + this.minDate);
    console.log('Max Date:' + this.maxDate);
    let defaultDate = new Date(timeDimension.default);
    console.log('Default Date:' + defaultDate.toISOString());
    this.dateValue = moment(defaultDate).format('DD/MM/YYYY HH:mm');
    console.log('Date Value:' + this.dateValue);
  }

  selectDataset() {
    this.layers = this.selectedDataset.Layer;
    this.map.getLayers().clear();
    this.map.addLayer(this.baseLayer);
    this.map.addLayer(this.vectorLayer);
    // clear any previously selected layers and/or drawn boxes
    this.selectedLayers = [];
    this.source.clear();
    this.boundingBoxPresent = false;
    this.updateTimeInfo();
  }

  toggleLayer(selectedLayer) {
    let index = this.selectedLayers.indexOf(selectedLayer);
    if (index === -1) {
      let layerToRemove = null;
      this.map.getLayers().forEach(mapLayer => {
        let layerName = mapLayer.get('name');
        if (selectedLayer.Name === layerName) {
          layerToRemove = mapLayer;
        }
      });

      if (layerToRemove) {
        this.map.removeLayer(layerToRemove);
      }
    } else {
      // let style = this.styles[Math.floor(Math.random() * this.styles.length)];
      //choose a pallete style, based on the selected layer index
      let style = this.styles[this.layers.indexOf(selectedLayer)];
      if (!style) {
        style = this.styles[0];
      }

      let bbox = null;
      if (this.source.getFeatures().length > 0) {
        // console.log(this.source.getFeatures()[0].getGeometry().getExtent());
        bbox = this.source.getFeatures()[0].getGeometry().getExtent();
      }

      let wmsLayer = new layer.Tile({
        extent: bbox !== null ? bbox : this.map.getView().calculateExtent(),
        opacity: 0.75,
        source: new source.TileWMS({
          attributions: [
            new Attribution({
              html: '<img class="ol-attribution-large" ' +
              'src="' + this.state.ncWMSUrl + 'wms?REQUEST=GetLegendGraphic&PALETTE=default&LAYERS=' + selectedLayer.Name + '&STYLES=default-scalar/' + style + '"/>'
            })
          ],
          projection: 'EPSG:3857',
          url: this.state.ncWMSUrl + 'wms?SERVICE=wms',
          crossOrigin: 'anonymous',
          params: {
            'LAYERS': selectedLayer.Name,
            'TIME': moment(this.dateValue, 'DD/MM/YYYY HH:mm').toISOString(),
            'STYLES': 'default-scalar/' + style
          }
        })
      });
      wmsLayer.set('name', selectedLayer.Name);
      this.map.addLayer(wmsLayer);
    }
  }

  onOpen() {
    $('#basicDialog').ejDialog('open');
  }

  onDialogClose() {
    $('#btnOpen').show();
  }

  showDialog() {
    $('#basicDialog').ejDialog('open');
    $('#btnOpen').hide();
  }

  toggleMenu() {
    $('#wrapper').toggleClass('toggled');
    this.menuDisplayed = !this.menuDisplayed;
  }

  changeTime(args) {
    console.log('Selected value:' + args.detail.value);
    this.dateValue = args.detail.value;
  }

  onClose(args) {
    let moment2 = moment(this.dateValue, 'DD/MM/YYYY HH:mm');
    console.log('New Date Value:' + moment2.toISOString());
    let mapLayers = this.map.getLayers().getArray();
    console.log(mapLayers.length);
    for (let a = 1; a < mapLayers.length; a++) {
      let mapLayer = mapLayers[a];
      mapLayer.getSource().updateParams({'TIME': moment2.toISOString()});
    }
  }

  @computedFrom('selectedDataset')
  get datasetSupportsRaw() {
    console.log(this.selectDataset !== null && this.selectedDataset.Title.startsWith('http://'));
    return this.selectDataset !== null && this.selectedDataset.Title.startsWith('http://');
  }

  @computedFrom('boundingBoxPresent', 'selectedLayers.length')
  get isSelectionPresent() {
    return this.selectedLayers.length > 0 ? true : this.boundingBoxPresent;
  }

  downloadRaw() {
    window.open(this.selectedDataset.Title + '.ascii?');
  }

  clearBox() {
    this.selectedLayers = [];
    this.map.getLayers().clear();
    this.map.addLayer(this.baseLayer);
    this.map.addLayer(this.vectorLayer);
    this.source.clear();
    this.boundingBoxPresent = false;
    this.map.getView().setCenter(proj.fromLonLat(this.startLonLat, 'EPSG:3857'));
    this.map.getView().setZoom(Pydap.ZOOM_LEVEL_DEFAULT);
  }
}
