'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
/*
  1. 创建一个Axios实例，实例的defaults属性为传入的defaultConfig
  2. 将实例方法request中的this绑定为刚创建的Axios实例,并返回request的包裹函数
  3. 将Axios.prototype的属性全部拷贝到包裹函数中，其中将方法内部的this绑定到实例
  4. 将实例的属性全部拷贝到包裹函数中
  5. 返回这个包裹函数
  6. 包裹函数调用时，就是调用request实例方法，且内部this指向新创建的Axios实例
     包裹函数同时拥有Axios所有的实例方法，这些实例方法内部的this指向新创建的Axios实例
     包裹函数同时拥有新创建的Axios实例的属性
*/
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  // bind函数返回一个包裹函数，将Axios.prototype.request函数内部的this绑定为context
  // instance为包裹函数，instance调用时，会调用Axios.prototype.request，且this指向context
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
// 将Axios的默认配置传入，作为实例的默认配置
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
// axios本身就是Axios的实例，axios.defaults保存了Axios的默认配置
// axios.create方法，将传入的实例配置与Axios默认配置合并作为统一配置，再根据统一配置创建Axios实例返回
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;
