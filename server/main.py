import webapp2
import rest

routes = [
	(r'/', rest.Root)
]

app = webapp2.WSGIApplication(routes, debug=True)
