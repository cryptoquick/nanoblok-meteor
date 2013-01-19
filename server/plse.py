from google.appengine.api import memcache
import webapp2
from google.appengine.ext.webapp import util

import os
import slimit

SCRIPT_PATH = "js"

# http://ronreiterdotcom.wordpress.com/2011/08/30/automatic-javascript-minification-using-slimit-on-google-app-engine/

class JavascriptMinifier(webapp.RequestHandler):
	MEMCACHE_MINIFIED_DATE_KEY = "minified_date_%s"
	MEMCACHE_MINIFIED_FILE_KEY ="minified_file_%s"

	def get(self, script_name):

		javascript_file = os.path.join(SCRIPT_PATH, script_name)
		if not javascript_file.endswith(".js"):
			raise Exception("not a javascript file.")

		mtime = os.path.getmtime(javascript_file)

		if mtime != memcache.get(self.MEMCACHE_MINIFIED_DATE_KEY % javascript_file):
			memcache.set(self.MEMCACHE_MINIFIED_DATE_KEY % javascript_file, mtime)
			minified_file = slimit.minify(open(javascript_file).read())
			memcache.set(self.MEMCACHE_MINIFIED_FILE_KEY % javascript_file, minified_file)
		else:
			minified_file = memcache.get(self.MEMCACHE_MINIFIED_FILE_KEY % javascript_file)

		self.response.out.write(minified_file)

def main():
	application = webapp.WSGIApplication([('/js/(.*)', JavascriptMinifier)],
		debug=True)
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()