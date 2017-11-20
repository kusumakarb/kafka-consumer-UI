from kafka import KafkaConsumer
from kafka import TopicPartition
import tornado
import json
import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.template
from config import KAFKA_BOOTSTRAP_SERVERS
from config import MESSAGE_BURST
import time
from random import randint


consumer = KafkaConsumer(bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
consumer.assign([TopicPartition('hello-csv', 0)])

class MainHandler(tornado.web.RequestHandler):
  def get(self):
    loader = tornado.template.Loader(".")
    self.write(loader.load("./resources/templates/graph.html").generate())

class WSHandler(tornado.websocket.WebSocketHandler):
  
  def check_origin(self, origin):
    return True
  
  def open(self):
    self.write_message("{}")
    # for message in consumer:
    #   messageJson = json.loads(message.value)
    #   self.write_message(json.dumps(messageJson))
    consumer.seek_to_end()

  def on_message(self, message):
    print(message)
    graphDataX = []
    graphDataY = []
    messageCount = 0
    somecount = 0
    for message in consumer:
      #print(message.timestamp)
      messageJson = json.loads(message.value)
      #print(str(messageJson))
      # transactionTime = message.timestamp #messageJson['trans_time']#message.timestamp
      # currentTransactionTime = int(transactionTime)
      # transactionAmount = messageJson['trans_amt']
      # graphDataX.append(currentTransactionTime)
      # graphDataY.append(transactionAmount)
      # graphData = {
      #   'graphDataX': graphDataX,
      #   'graphDataY': graphDataY
      # }
      messageCount += 1
      #print(messageCount)
      self.write_message(json.dumps(messageJson))
      if messageCount == MESSAGE_BURST:
        #print(json.dumps(str(messageJson)))
        #self.write_message(json.dumps(messageJson))
        # del graphData['graphDataX']
        # del graphData['graphDataY']
        break

  def on_close(self):
    print('Websocket Connection Closed')


def startWebApplication():
  return tornado.web.Application([
  (r'/ws', WSHandler),
  (r"/", MainHandler),
  (r"/(.*)", tornado.web.StaticFileHandler, {"path": "./resources"}),
])


application = startWebApplication()

application.listen(9091)
tornado.ioloop.IOLoop.instance().start()


