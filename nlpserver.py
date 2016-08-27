import zerorpc
import nltk
import os
class medBot(object):
    def hello(self, name):
        sentences = nltk.sent_tokenize(name)
        sentences = [nltk.word_tokenize(sent) for sent in sentences]
        sentences = [nltk.pos_tag(sent) for sent in sentences]
        return "Hello, %s" % sentences

ip = os.environ.get('OPENSHIFT_NODEJS_IP')
if not ip:
    ip = '127.0.0.1'
port = os.environ.get('OPENSHIFT_NODEJS_PORT')
if not port:
    port = '4242'
tcp_address = 'tcp://'+ip+':4242'
s = zerorpc.Server(medBot())
s.bind(tcp_address)
s.run()
##https://blogs.princeton.edu/etc/files/2014/03/Text-Analysis-with-NLTK-Cheatsheet.pdf
