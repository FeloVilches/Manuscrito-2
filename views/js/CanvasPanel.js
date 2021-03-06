const DotCanvas = require('./DotCanvas');
const InputService = require('./InputService');
const config = require('electron').remote.require('./config');
const ShowRep = require('./ShowRep');

var squareWidth = 5;
var canvas;
module.exports.canvasEmpty = function(){
  return canvas.isEmpty();
};

function copyCanvas(prettyLines, canvas){

  var ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for(i in prettyLines){
    ctx.beginPath();
    ctx.moveTo(prettyLines[i][0].x, prettyLines[i][0].y);
    for(j in prettyLines[i]){
      ctx.lineTo(prettyLines[i][j].x, prettyLines[i][j].y);
      ctx.fillRect(prettyLines[i][j].x - (squareWidth/2), prettyLines[i][j].y - (squareWidth/2), squareWidth, squareWidth);
    }
    ctx.stroke();
  }
}


function hideOrShow(){
  if(config.getHide() && !canvas.isEmpty()){
    ShowRep.hideWord();
  } else {
    ShowRep.unHideWord();
  }
}


$(document).ready(function(){

  // Copy width & height
  $('#canvas-mirror').attr('height', $('#canvas-main').attr('height'));
  $('#canvas-mirror').attr('width', $('#canvas-main').attr('width'));

  var canvasMirror = $('#canvas-mirror')[0];

  canvas = new DotCanvas($('#canvas-main')[0], {
    period: 5,
    lineWidth: 6,
    color: "#404769"
  },
  function(){
    copyCanvas(canvas.getPrettyLines(), canvasMirror);
    hideOrShow();
  },
  function(){
    canvasMirror.getContext("2d").clearRect(0, 0, canvasMirror.width, canvasMirror.height);
    hideOrShow();
  });



  var service = new InputService({
    width: Number($('#canvas-main').attr('width')),
    height: Number($('#canvas-main').attr('height')),
    lang: "ja"
  });

  $("#canvas-clear").click(() => canvas.clear());

  $('#canvas-undo').click(() => canvas.undo());

  $(document).bind('keydown', function(e){
    if (e.keyCode == 90 && e.ctrlKey){
      if($('input:focus, textarea:focus').length > 0)
        return;
      canvas.undo();
      e.preventDefault();
    }
  });

  $("#canvas-answer").click(function(){
    var lines = canvas.getLines();

    $("#canvas-answer").hide();
    $("#canvas-answer-loading").show();

    service.getCharacters(lines, data => {

      if(data == null || data.length == 0) return;
      ShowRep.tryAnswer(data, function(success){
        canvas.clear();
      });

      $("#canvas-answer").show();
      $("#canvas-answer-loading").hide();

    }, e => {
      $("#canvas-answer").show();
      $("#canvas-answer-loading").hide();
      console.log("Error:", e);
    });
  });


  $("#canvas-not-now").click(function(){
    ShowRep.notNow(function(){
      canvas.clear();
    });
  });


  $("#canvas-get").click(function(){
    var lines = canvas.getLines();
    service.getCharacters(lines, data => {

      $("#result").html('');
      for(i in data){
        $("#result").append('<span class="single-result">' + data[i] + '</span>');
      }

    }, e => { console.log("Error:", e); });
  });

});
