'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Data = mongoose.model('Data'),
  Task = mongoose.model('Task'),
  xray = require('x-ray'),
  Promise = require('bluebird'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
const _NightMare = require('nightmare');
_NightMare.Promise = Promise;
_NightMare.xray = xray;
const nightmare = _NightMare({ show: true });
/**
 * Start a job
 */
exports.start = function (req, res) {
  if (req.query.site) {
    var url = 'https://www.zara.com/fr';
    if (req.query.site === 'www.zara.com') {
      console.log(url);
      Task.findOne({ site: 'www.zara.com' })
        .then(function (task) {
          if (task) {
            task.status = 'started';
            task.save();
          } else {
            var t = new Task();
            t.site = 'www.zara.com';
            t.status = 'started';
            t.save();
          }
        });
      zaraCrawlingStart(url); // threads
      return res.status(200).send({
        status: 'started',
        site: req.query.site
      });
    }
  } else {
    return res.status(200).send({
      status: 'failure',
      message: 'Please input valid params'
    });
  }
};
/**
 * Stop a job
 */
exports.stop = function (req, res) {
  return res.status(200).send({
    status: 'success'
  });

};
function sequentialAsyncMap(array, fn) {
  var p = Promise.resolve();
  array.forEach(function (item, index, collection) {
    p = p.then(function () {
      return fn(item, index, collection);
    });
  });
  return p;
}
function saveData(value) {
  var spData = new Data();
  if (value.collection) spData.collectionName = value.collection;
  if (value.category) spData.category = value.category;
  if (value.subCategory) spData.subCategory = value.subCategory;
  if (value.miniCategory) spData.miniCategory = value.miniCategory;
  if (value.subHref) spData.urlItem = value.subHref;
  if (value.designation) spData.designation = value.designation;
  if (value.description) spData.description = value.description;
  if (value.composition) spData.composition = value.composition;
  if (value.price) spData.price = value.price;
  if (value.idModeItem) spData.idModeItem = value.idModeItem;
  if (value.color) spData.color = value.color;
  if (value.size) spData.size = value.size;
  if (value.urlPicture) spData.urlPicture = value.urlPicture;
  spData.brand = 'zara';
  //  Save Data information.
  return spData.save();
}
function save(spDataObjectArray) {
  if (!spDataObjectArray) {
    return;
  } else {
    return sequentialAsyncMap(spDataObjectArray, saveData);
  }
}
function duplicationsRemove(va1, va2) {
  var array1 = [];
  var array2 = [];
  var array3 = [];
  for (var i = 0; i < va1.length; i++) {
    array1.push(va1[i].href.toString());
  }
  for (var j = 0; j < va2.length; j++) {
    array2.push(va2[j].href.toString());
  }
  array3 = Array.from(new Set(array2.concat(array1)));
  var obj = [];
  for (var k = 0; k < array3.length; k++) {
    obj.push({ href: array3[k], collection: getObject(array3[k], va2).collection,
      category: getObject(array3[k], va2).category, subCategory: getObject(array3[k], va2).subCategory,
      miniCategory: getObject(array3[k], va2).miniCategory });
  }
  return obj;
}
function getObject(href, objArray) {
  for (var i = 0; i < objArray.length; i++) {
    if (objArray[i].href === href)
      return objArray[i];
  }
  return { collection: '', category: '', subCategory: '', miniCategory: '' };
}
/**
 * zara
 */
function delay(ms) {
  var cur_d = new Date();
  var cur_ticks = cur_d.getTime();
  var ms_passed = 0;
  while (ms_passed < ms) {
    var d = new Date(); // Possible memory leak?
    var ticks = d.getTime();
    ms_passed = ticks - cur_ticks;
    // d = null;  // Prevent memory leak?
  }
}
var collections = ['femme', 'trf', 'homme', 'enfants'];
function zaraCrawlingStart(url) {
  return nightmare
    .goto(url)
    .evaluate(function () {
      var elements = Array.from(document.getElementsByClassName('_category-link'));
      return elements.map(function (element) {
        return {
          href: element.href
        };
      });
    })
    .then((result) => {
      // ... get all href
      var _available_links = [];
      result.forEach(function (item) {
        var str = '/fr/fr/';
        if (item.href.includes(str) && (item.href.split('-').length - 1) > 1) _available_links.push(item);
      });
      var productions = [];
      console.log(_available_links.length + ' :total');
      _available_links.forEach(function (link) {
        delay(100);
        var classCg = link.href.split('https://www.zara.com/fr/fr/')[1].split('.html')[0].split('-');
        classCg.pop();
        var depth = classCg.length;
        var production = {};
        if (depth < 5) {
          if (depth === 2) {
            production = { collection: classCg[0], category: classCg[1],
              subCategory: '', miniCategory: '' };
          } else if (depth === 3) {
            production = { collection: classCg[0], category: classCg[1],
              subCategory: classCg[2], miniCategory: '' };
          } else if (depth === 4) {
            production = { collection: classCg[0], category: classCg[1],
              subCategory: classCg[2], miniCategory: classCg[3] };
          }
          console.log(classCg);
          production.href = link.href;
          productions.push(production);
        }
      });
      var rows = [];
      rows = duplicationsRemove(productions, productions);
      var realProductions = [];
      return Promise.map(rows, function (production) {
        var cr = xray();
        return cr(production.href, '.product', [{
          subHref: 'a@href',
          urlPicture: '.product img@src'
        }])
          .then(function (items) {
            var productionsPerLink = [];
            items.forEach(function (item) {
              if (item.subHref) {
                item.href = production.href;
                item.collection = production.collection;
                item.category = production.category;
                item.subCategory = production.subCategory;
                item.miniCategory = production.miniCategory;
                productionsPerLink.push(item);
              }
            });
            console.log(productionsPerLink.length);
            realProductions = realProductions.concat(productionsPerLink);
            return production;
          });
      }, { concurrency: 2 })
        .then(function (productions) {
          console.log(realProductions.length + ': real');
          var temp = [];
          realProductions.forEach(function (res) {
            if (typeof res !== 'undefined') temp.push(res);
          });
          console.log(temp.length + ': final');
          return Promise.map(temp, function (item) {
            return nightmare
              .goto(item.subHref)
              .click('._product-composition')
              .wait('#popup-composition')
              .evaluate(function () {
                var designation = Array.from(document.getElementsByClassName('product-name'));
                var description = Array.from(document.getElementsByClassName('description'));
                var idModeItem = Array.from(document.getElementsByClassName('product-color'));
                var size = Array.from(document.getElementsByClassName('size-list'));
                var price = Array.from(document.getElementsByClassName('price'));
                var composition = Array.from(document.getElementsByClassName('zonasPrenda'));
                var des,
                  id,
                  s,
                  p,
                  com;
                if (!designation) return { error: 'error' };
                if (!description) des = '';
                else des = description[0].innerText;
                if (!idModeItem) id = '';
                else id = idModeItem[0].innerText;
                if (!size) s = '';
                else s = size[0].innerText;
                if (!composition) com = '';
                else com = composition[0].innerText;
                if (!price) p = '';
                else p = price[0].innerText;

                return com + '*' + p +
                 '*' + designation[0].innerText + '*' + des + '*' + id
                 + '*' + s;
              })
              .then(function (value) {
                console.log(value);
                item.composition = value.split('*')[0];
                item.price = value.split('*')[1];
                item.designation = value.split('*')[2];
                item.description = value.split('*')[3];
                item.idModeItem = value.split('*')[4];
                item.color = item.idModeItem.split(' - ')[0];
                item.size = value.split('*')[5].replace('\n', ', ');
                return saveData(item);
              })
              .catch(function (err) {
                return { error: 'error' };
              });
          }, { concurrency: 1 })
            .then(function (result) {
              return Task.findOne({ site: 'www.zara.com' })
                .then(function (task) {
                  task.status = 'finished';
                  return task.save();
                });
            });
        });
    })
    .then(function (err) {
      nightmare.end();
      console.log(err);
    });
}
exports.getJobStatus = function (req, res) {
  Task.find()
    .then(function (jobs) {
      return res.status(200).send({
        jobs: jobs,
        message: 'success'
      });
    })
    .catch(function (err) {
      return res.status(200).send({
        message: err
      });
    });
};
