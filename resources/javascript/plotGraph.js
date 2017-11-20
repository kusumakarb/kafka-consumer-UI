/**
 * Created by kusumakar on 14/9/17.
 */
var WEBSOCKET_HOST = "172.31.4.97"
var WEBSOCKET_PORT = "9091"
var WEBSOCKET = "ws://" + WEBSOCKET_HOST + ":" + WEBSOCKET_PORT + "/ws"
ws = new WebSocket(WEBSOCKET);

var request_data_interval;
var UPPERWARNING = 81;
var UPPERACTION = 114;
var TRANSACTION_BURST = 50;

var layout = {
  title: "Real Time Outlier Detection",
  xaxis: {title: 'Time'},
  yaxis: {title: 'Transaction Amount'}
};


function rand() {
    return Math.random();
}

ws.onopen = function() {

    var time = new Date().getTime();


    var transactions = [{
      x: [time],
      y: [100],
      mode: 'markers',
      line: {color: '#80CAF6'},
      name: 'Transactions'
    }];

    var upperWarning = [{
      x: [time],
      y: [UPPERWARNING],
      mode: 'lines',
      line: {color: 'orange'},
        name: 'Upper Warning'
    }];

    var upperAction = [{
      x: [time],
      y: [UPPERACTION],
      mode: 'lines',
      line: {color: 'red'},
        name: 'Upper Actions'
    }];

    Plotly.plot('graph', transactions, layout);
    Plotly.addTraces('graph', upperWarning);
    Plotly.addTraces('graph', upperAction);

    ws.send("getData");

};

var timeToInt = function (x) {
    return (new Date(parseInt(x)));
} 

ws.onmessage = function (evt) {


    var received_msg = evt.data;
    var time = new Date();
    const data = JSON.parse(evt.data);

    var transactionTimes = data.graphDataX;
    var graphDataX = transactionTimes.map(timeToInt);
    var graphDataY = data.graphDataY;
    time = graphDataX[0];

    var transactions = {
      x:  [graphDataX],
      y: [graphDataY]
    };


    for (var UPPERWARNING_ARRAY = [],i=0;i<TRANSACTION_BURST;++i) UPPERWARNING_ARRAY[i]=UPPERWARNING;
    for (var UPPERACTION_ARRAY = [],i=0;i<TRANSACTION_BURST;++i) UPPERACTION_ARRAY[i]=UPPERACTION;

    var upperWarning = {
      x:  [graphDataX],
      y: [UPPERWARNING_ARRAY]
    };

    var upperAction = {
      x:  [graphDataX],
      y: [UPPERACTION_ARRAY]
    };

    var olderTime = time.setSeconds(time.getSeconds() - 30);
    var futureTime = time.setSeconds(time.getSeconds() + 30);

    var minuteView = {
        xaxis: {
            type: 'date',
            range: [olderTime,futureTime]
        }
    };


    var layoutPromise =  Plotly.relayout('graph', minuteView, layout);

    var transactionPromise = Plotly.extendTraces('graph', transactions,[0]);
    var upperWarningPromise = Plotly.extendTraces('graph', upperWarning, [1]);
    var upperActionPromise = Plotly.extendTraces('graph', upperAction, [2]);

    var promisesList = [layoutPromise, transactionPromise, upperWarningPromise, upperActionPromise]

    Promise.all(promisesList).then(() => {
        ws.send("getData");
    });

};

ws.onclose = function() {
  // websocket is closed.
  console.log("Websocket Closed!")
};

function requestData() {
    ws.send("get-data");
}
