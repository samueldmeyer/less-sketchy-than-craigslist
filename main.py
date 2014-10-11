import json
import webapp2
import logging
import random
import hashlib
import datetime
from string import letters

from google.appengine.ext import ndb
from google.appengine.api import memcache
from google.appengine.api import users

secret = 'fasd@#$%@#$%234523452'

def render_str(template, **params):
    t = jinja_env.get_template(template)
    return t.render(params)

def make_secure_val(val):
    return '%s|%s' % (val, hmac.new(secret, val).hexdigest())

def check_secure_val(secure_val):
    val = secure_val.split('|')[0]
    if secure_val == make_secure_val(val):
        return val

class BaseHandler(webapp2.RequestHandler):
    def write(self, *a, **kw):
        self.response.out.write(*a, **kw)
    def render_json(self, d):
        json_txt = json.dumps(d)
        self.response.headers['Content-Type'] = 'application/json; charset=UTF-8'
        self.write(json_txt)
    def write_debug(self, *a, **kw):
        self.response.write(*a, **kw)
        self.response.headers['Content-Type'] = 'text/plain'
    def set_secure_cookie(self, name, val):
        cookie_val = make_secure_val(val)
        self.response.headers.add_header(
            'Set-Cookie',
            '%s=%s; Path=/' % (name, cookie_val))
    def read_secure_cookie(self, name):
        cookie_val = self.request.cookies.get(name)
        return cookie_val and check_secure_val(cookie_val)
    def login(self, user):
        self.set_secure_cookie('user_id', str(user.key().id()))
    def logout(self):
        self.response.headers.add_header('Set-Cookie', 'user_id=; Path=/')
    def initialize(self, *a, **kw):
        webapp2.RequestHandler.initialize(self, *a, **kw)
        uid = self.read_secure_cookie('user_id')
        self.user = uid and User.by_id(int(uid))

        if self.request.url.endswith('.json'):
           self.format = 'json'
        else:
           self.format = 'html'

##### Other models

class SellItem(ndb.Model):
    title = ndb.StringProperty(required = True)
    cost = ndb.FloatProperty(required = True)
    selling_app_user_id = ndb.IntegerProperty()
    description = ndb.TextProperty()
    location = ndb.TextProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)

class UserReview(ndb.Model):
    rating = ndb.IntegerProperty()
    review_text = ndb.TextProperty()
    source_user_id = ndb.IntegerProperty()
    # created = ndb.DateTimeProperty(auto_now_add = True)


##########

##### user stuff
def make_salt(length = 5):
    return ''.join(random.choice(letters) for x in xrange(length))

def make_pw_hash(name, pw, salt = None):
    if not salt:
        salt = make_salt()
    h = hashlib.sha256(name + pw + salt).hexdigest()
    return '%s,%s' % (salt, h)

def make_user_hash(user_id):
    return hashlib.sha256(user_id + secret).hexdigest()

def valid_pw(name, password, h):
    salt = h.split(',')[0]
    return h == make_pw_hash(name, password, salt)

def users_key(group = 'default'):
    return ndb.Key.from_path('users', group)

class AppUser(ndb.Model):
    display_name = ndb.StringProperty()
    email = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    user_id = ndb.StringProperty() # This is a Google user id across applications, and should never be displayed to other users
    rating = ndb.FloatProperty()
    rating_list = ndb.StructuredProperty(UserReview, repeated=True)

    @classmethod
    def by_name(cls, name):
        logging.error("test")
        logging.error(name)
        logging.error("test")
        u = AppUser.query(AppUser.display_name == name).get()
        return u

    @classmethod
    def by_user_hash(cls, name):
        u = AppUser.query(AppUser.user_id_hash == name).get()
        return u

    @classmethod
    def by_user_id(cls, user_id):
        u = AppUser.query(AppUser.user_id == str(user_id)).get()
        return u

    @classmethod
    def register(cls, user_id, name = "user1234", email = None):
        # Registers a user, should be passed a Google ID as user_id
        new_user =  AppUser(display_name = name,
            user_id = str(user_id),
            email = email)
        new_user.put()
        return new_user

    @classmethod
    def login(cls, name, pw):
        u = cls.by_name(name)
        if u and valid_pw(name, pw, u.pw_hash):
            return u

    @classmethod
    def by_user_object(cls, user):
        """gets an app_user from a Google ID user"""
        return AppUser.by_user_id(user.user_id())

    def add_review(self, user_review):
        user = users.get_current_user()
        app_user = AppUser.by_user_object(user)
        current_num_reviews = len(app_user.rating_list)
        app_user.rating_list.append(user_review)
        if (app_user.rating is None) or (current_num_reviews < 1):
            app_user.rating = user_review.rating
        else:
            app_user.rating = (app_user.rating * current_num_reviews + 
                user_review.rating) / (current_num_reviews + 1)
        app_user.put()
        # output = new_review.to_dict(exclude = ['created'])
        # self.render_json(output)


# UserReview(
#             rating = 5,
#             review_text = "Good person.",
#             source_user_id = app_user.user_id_hash)
################################

class MainAppHandler(BaseHandler):
    def get(self):
        user = users.get_current_user()
        if user:
            self.write(open('index.html', 'r').read())
        else:
            self.write('<a href="%s">Sign in or register</a>.' %
                        users.create_login_url('/'))

class MyHandler(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if user:
            greeting = ('Welcome, %s! (<a href="%s">sign out</a>)' %
                        (user.nickname(), users.create_logout_url('/')))
        else:
            greeting = ('<a href="%s">Sign in or register</a>.' %
                        users.create_login_url('/'))

        self.response.out.write('<html><body>%s</body></html>' % greeting)

class ItemListHandler(BaseHandler):
    def get(self):
        user = users.get_current_user()
        if user:
            returned_results = 100
            results = SellItem.query().fetch(returned_results)
            result_list = [result.to_dict(exclude=['created']) for result in results]
            for i in xrange(0, len(result_list)):
                result_list[i]['id'] = results[i].key.id()
                result_list[i]['created'] = (results[i].created-datetime.datetime(1970,1,1)).total_seconds()
            self.render_json(result_list)
        else:
            self.error(403)
    def post(self):
        user = users.get_current_user()
        if user:
            app_user = AppUser.by_user_object(user)
            if app_user is None:
                app_user = AppUser.register(name = user.nickname(), email=user.email(), user_id=user.user_id())
            body = json.loads(self.request.body)
            title = body['title']
            cost = float(body['cost'])
            logging.error(cost)
            selling_app_user_id = app_user.key.id()
            logging.error(type(selling_app_user_id))
            description = body['description']
            location = body['location']

            new_item = SellItem(title=title, cost=cost, 
                selling_app_user_id=selling_app_user_id, location=location,
                description=description)
            key = new_item.put()
            output = new_item.to_dict(exclude=['created'])
            output['id'] = new_item.key.id()
            self.render_json(output)
        else:
            self.error(403)

class ItemHandler(BaseHandler):
    def get(self, item_id):
        user = users.get_current_user()
        if user:
            result = SellItem.get_by_id(int(item_id))
            output = result.to_dict(exclude=['created'])
            app_user = AppUser.by_user_object(user)
            output['email'] = app_user.email
            output['id'] = item_id
            self.render_json(output)
        else:
            self.error(403)

class ReviewListHandler(BaseHandler):
    def post(self, target_app_user_id):
        user = users.get_current_user()
        app_user = AppUser.by_user_object(user)
        body = json.loads(self.request.body)
        target_user = AppUser.get_by_id(target_app_user_id)
        new_review = UserReview(
            rating = int(body['rating']),
            review_text = body.get('review_text', ''),
            source_user_id = app_user.key.id())
        app_user.add_review(new_review)
        app_user.put()
        output = new_review.to_dict(exclude = ['created'])
        self.render_json(output)

class UserHandler(BaseHandler):
    def get(self, app_user_id):
        app_user = AppUser.get_by_id(int(app_user_id))
        output = app_user.to_dict(exclude=['created', 'rating_list.created', 'user_id'])
        output['id'] = app_user.key.id()
        self.render_json(output)

app = webapp2.WSGIApplication([('/', MainAppHandler),
                               ('/logout', MyHandler),
                               ('/items', ItemListHandler),
                               (r'/items/(\d+)', ItemHandler),
                               (r'/users/([^/]+)/reviews/?', ReviewListHandler),
                               (r'/users/(\d+)', UserHandler)],
                              debug=True)
