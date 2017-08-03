const Datastore = require('nedb');
const dbFileName = '.data/data.db';
const _ = require('lodash');

var ds = null;

function getDS(){
  if(ds == null){
    //console.log("Starting DB...");
    ds = new Datastore({
  		filename: dbFileName,
  		autoload: true,
  		timestampData: true
  	});
  } else {
    //console.log("DB is already open.");
  }
  return ds;
}

module.exports = {

  getTotalCount: function(callback){
    getDS().count({}, callback);
  },

  setDS(differentDS){
    ds = differentDS;
  },


  insertBatch: function(words, callback){
    var objs = [];
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    for(i in words){
      objs.push({
        word: words[i],
        nextRep: tomorrow,
        lastInterval: 24 * 60 * 60,
        repCount: 0
      });
    }
    getDS().insert(objs, callback);
  },

  getNearestWords: function(n, callback){
    getDS().find({ }).sort({ nextRep: 1 }).limit(n).exec(callback);

  },

  rescheduleDoc: function(doc, score){

    var newDoc = _.cloneDeep(doc);
    if(newDoc.nextRep.getTime() < new Date().getTime()){

      var multiplier = 2 * score / 100;
      // [0, 100) interval is reduced
      // 100 interval is kept the same
      // (100, 200] interval is enlarged

      var interval = Math.floor(newDoc.lastInterval * multiplier);
      newDoc.nextRep.setSeconds(newDoc.nextRep.getSeconds() + interval);
      newDoc.lastInterval = interval;
    }

    newDoc.repCount++;
    return newDoc;
  },


  updateWordSchedule: function(wordId, score, callback){

    if(score < 0 || score > 100){
      throw new Error('Score must be 0-100 inclusive.');
    }

    getDS().findOne({ _id: wordId }, function(err, doc) {
      if(err){
        callback(err);
      }

      getDS().update({ _id: wordId }, module.exports.rescheduleDoc(doc, score), {}, callback);

    });
  }
};