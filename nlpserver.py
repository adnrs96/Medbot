import sys, json, nltk

def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def main():
    name = read_in()
    nltk.data.path.append("/var/lib/openshift/57c2ff777628e1c6210000af/app-root/data/bin/nltk_data")
    sentences = nltk.sent_tokenize(name)
    sentences = [nltk.word_tokenize(sent) for sent in sentences]
    sentences = [nltk.pos_tag(sent) for sent in sentences]
    print "Hello, %s" % sentences

if __name__ == '__main__':
    main()

##https://blogs.princeton.edu/etc/files/2014/03/Text-Analysis-with-NLTK-Cheatsheet.pdf
