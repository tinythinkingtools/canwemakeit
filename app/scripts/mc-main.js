'use strict';

var Handlebars = (window.Handlebars) ? window.Handlebars : false;
var _ = (window._) ? window._ : false;
if(!_ || !Handlebars) {
  throw new Error ('Handlebars or lodash / underscrore not included. Quitting now');
}

var mc = (mc) ? mc : {};

mc.probabilityForAndOr = 0.2;

mc.types = [
  'thing',
  'action',
  'logic',
  'trigger'
];

mc.state = {
  thing: {
    thing1: 0
  },
  action: {
    action1: 0
  },
  logic: {
    logic1: 0
  },
  trigger: {
    trigger1: 0
  }
};

$(document).ready(function() {

  var itemSource = $('#item-template').html();
  var ctaSource = $('#cta-template').html();
  var itemTemplate = Handlebars.compile(itemSource);
  var ctaTemplate = Handlebars.compile(ctaSource);
  var ctaContext = {};

  //take mc.state and render the data
  var render = function() {
    _.each(mc.types, function(type) {
      ctaContext[type] = renderOne(type);
    });
    $('.mc-content').html(ctaTemplate(ctaContext));
  };

  //render one type
  var renderOne = function(type) {
    var context = {
      type: type,
      id1: type+'1',
      content1: mc.data[type][mc.state[type][type+'1']],
      isConnector: (mc.state[type].connector === undefined) ? false : true,
      connector: mc.data.connector[mc.state[type].connector],
      id2: type+'2',
      content2: mc.data[type][mc.state[type][type+'2']]
    };
    return itemTemplate(context);
  };

  //extend trigger or action with a certain probability
  var possiblyExtend = function(value, valueType) {
    var rand = Math.random();
    if(rand > mc.probabilityForAndOr) {
      return value;
    }
    var connector = _.random(0, mc.data.connector.length - 1);
    var addOn = _.random(0, mc.data[valueType].length - 1);
    //make sure addOn is not the same as value
    while(addOn === value[valueType+'1']) {
      addOn = _.random(0, mc.data[valueType].length - 1);
    }
    value.connector = connector;
    value[valueType+'2'] = addOn;
    return value;
  };

  //update mc.state to random
  var randomState = function() {
    var newState = {};
    _.each(mc.types, function(type) {
      newState[type] = {};
      newState[type][type+'1'] = _.random(0, mc.data[type].length-1);
    });
    newState.action = possiblyExtend(newState.action, 'action');
    newState.trigger = possiblyExtend(newState.trigger, 'trigger');
    mc.state = newState;
  };
  
  //update one item in the state
  var updateOneItem = function(obj) {
    var group = obj.closest('.mc-group');
    if(!group) {
      return;
    }
    var groupType = group.attr('data-mcType');
    var itemType = obj.attr('data-mcType');
    var itemId = obj.attr('id');
    var currentGroupState = mc.state[groupType];
    if(!itemId) {
      itemId = 'connector';
    }
    //increment
    currentGroupState[itemId]++;
    //if last - start again
    if(currentGroupState[itemId] > mc.data[itemType].length-1) {
      currentGroupState[itemId] = 0;
    }
    mc.state[groupType] = currentGroupState;
  };

  var doMc = function() {
    randomState();
    render();
  };

  doMc();

  $('#next-button').on('click', doMc);
  $('body').on('click', '.mc-item', function(e){
    updateOneItem($(e.target));
    render();
  });

});

