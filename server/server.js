'use strict';

var mongoose = require('./mongoose'),

  passport = require('passport'),
  express = require('express'),
  jwt = require('jsonwebtoken'),
  expressJwt = require('express-jwt'),
  router = express.Router(),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  request = require('request'),
  Twitter = require('twitter');

mongoose();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

var User = require('mongoose').model('User');
var passportConfig = require('./passport');

//setup configuration for facebook login
passportConfig();

var app = express();

// enable cors
var corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

//rest API requirements
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

router.route('/health-check').get(function(req, res) {
  res.status(200);
  res.send('Hello World');
});

var createToken = function(auth) {
  return jwt.sign({
    id: auth.id
  }, 'my-secret',
  {
    expiresIn: 60 * 120
  });
};

var generateToken = function (req, res, next) {
  req.token = createToken(req.auth);
  return next();
};

var sendToken = function (req, res) {
  res.setHeader('x-auth-token', req.token);
  return res.status(200).send(JSON.stringify(req.user));
}

router.route('/auth/twitter/reverse')
  .post((req, res) => {
    request.post({
      url: 'https://api.twitter.com/oauth/request_token',
      oauth: {
        oauth_callback: "",
        consumer_key: '',
        consumer_secret: ''
      }
    }, function (err, r, body) {
      if (err) {
        return res.send(500, { message: e.message });
      }


      var jsonStr = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
      res.send(JSON.parse(jsonStr));
    });
  });

router.route('/auth/twitter')
  .post((req, res, next) => {
    request.post({
      url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
      oauth: {
        consumer_key: '',
        consumer_secret: '',
        token: req.query.oauth_token
      },
      form: { oauth_verifier: req.query.oauth_verifier }
    }, function (err, r, body) {
      if (err) {
        return res.send(500, { message: err.message });
      }

      const bodyString = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
      const parsedBody = JSON.parse(bodyString);

      req.body['oauth_token'] = parsedBody.oauth_token;
      req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
      req.body['user_id'] = parsedBody.user_id;


      next();
    });
  }, passport.authenticate('twitter-token', {session: false}), function(req, res, next) {
      if (!req.user) {
        return res.send(401, 'User Not Authenticated');
      }

      // prepare token for API
      req.auth = {
        id: req.user.id
      };

      return next();
    }, generateToken, sendToken);

//token handling middleware
var authenticate = expressJwt({
  secret: 'my-secret',
  requestProperty: 'auth',
  getToken: function(req) {
    if (req.headers['x-auth-token']) {
      return req.headers['x-auth-token'];
    }
    return null;
  }
});

var getCurrentUser = function(req, res, next) {
  User.findById(req.auth.id, function(err, user) {
    if (err) {
      next(err);
    } else {
      req.user = user;
      next();
    }
  });
};

var getOne = function (req, res) {
  var user = req.user.toObject();
  delete user['twitterProvider'];
  delete user['__v'];

  res.json(user);
};

router.get('/fetchfollowers', authenticate, getCurrentUser, function(req, res, next) {
  var client = new Twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: req.user['twitterProvider'].token,
    access_token_secret: req.user['twitterProvider'].tokenSecret
  });
  client.get('friends/list', {count: 200}, function(error, data, response) {
    if (error) {
      return console.log(error);
    } else {
      var followers_array = data.users.map(user => {
         return {
           'follower_id': user.id,
           'name': user.name,
           'follower_image_url': user.profile_image_url,
           'screen_name': user.screen_name,
           'followers_count': user.followers_count,
           'friends_count': user.friends_count
         };
      });
      res.send(followers_array);
    }
  })
});

router.get('/fetchprofilebanner', authenticate, getCurrentUser, function(req, res, next) {
  var client = new Twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: req.user['twitterProvider'].token,
    access_token_secret: req.user['twitterProvider'].tokenSecret
  });
  var myinfo_array = new Array();
  client.get('account/verify_credentials', function(error, data, response) {
    if (error) {
      return console.log(error);
    }
    else {
      myinfo_array.push({
        'myinfo_image_url': data.profile_image_url_https.replace(/_normal|_bigger/, ''),
        'myinfo_screen_name': data.screen_name,
        'myinfo_myid': data.id,
        'myinfo_real_name': data.name,
        'myinfo_banner': null
      });
      getMyBanner(data.id, next);
    }
  });
  function getMyBanner(user_id, next) {
    client.get('users/profile_banner', {user_id: user_id}, function(error, data, response) {
      if (error) throw error;
      myinfo_array["0"].myinfo_banner = data.sizes.web.url
      res.send(myinfo_array);
    });
  };
});

router.post('/unfollow', authenticate, getCurrentUser, function(req, res, next) {
  var client = new Twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: req.user['twitterProvider'].token,
    access_token_secret: req.user['twitterProvider'].tokenSecret
  });
  var userIds = req.body.id;
  unfollowUsers(userIds, next);
  function unfollowUsers(userIds, next) {
    client.post('friendships/destroy', { user_id: userIds }, function(error,data,response) {
      if (error => {
        console.warn(error);
        res.status(500).send({error:error})
      })
      res.status(200).send("succccess")
    })
  };
});

router.post('/follow', authenticate, getCurrentUser, function(req, res, next) {
  var client = new Twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: req.user['twitterProvider'].token,
    access_token_secret: req.user['twitterProvider'].tokenSecret
  });
  var userIds = req.body.id;
  followUsers(userIds, next);
  function followUsers(userIds, next) {
    client.post('friendships/create', { user_id: userIds }, function(error,data,response) {
      if (error => {
        console.warn(error);
        res.status(500).send({error:error})
      })
      res.status(200).send("success")
    })
  };
});

router.get('/search', authenticate, getCurrentUser, function(req, res, next) {
  var client = new Twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: req.user['twitterProvider'].token,
    access_token_secret: req.user['twitterProvider'].tokenSecret
  });
  console.log(req.query)
  client.get('users/search', {q: req.query.param, page: req.query.page, count: 14}, function(error, data, response) {
    if (error) {
      return console.log(error);
    } else {
      var search_array = new Array();
      for (var i = 0; i < data.length; i++ ) {
        search_array.push({
          'user_id': data[i].id,
          'user_name': data[i].name,
          'user_image.url': data[i].profile_image_url,
          'user_screen_name': data[i].screen_name,
          'user_followers_count': data[i].followers_count
        });
      }
      res.send(search_array);
    }

    });

    function getInformationOnFollowers(user_ids, next) {
      client.get('users/lookup', {user_id: user_ids.join()}, function(error, data, response) {
        if (error) throw error;
        var followers_array = new Array();
        for (var i = 0; i < data.length; i++ ) {
          followers_array.push({
            'follower_id': data[i].id,
            'name': data[i].name,
            'follower_image_url': data[i].profile_image_url,
            'screen_name': data[i].screen_name,
            'followers_count': data[i].followers_count,
            'friends_count': data[i].friends_count
          });
        }
        res.send(followers_array);
      });
    };
});

router.route('/auth/me')
  .get(authenticate, getCurrentUser, getOne);

app.use('/api/v1', router);

app.listen(4000);
module.exports = app;
console.log('Server runnning at http://localhost:4000/');
