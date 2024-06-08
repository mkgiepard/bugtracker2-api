const router = require("express").Router();
const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const BugReport = mongoose.model("BugReport");

router.get("/settings", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({ msg: "SUCCESS: protected /settings route (3000)" });
});

router.get("/testing", (req, res) => {
  res.json({ msg: "SUCCESS: not protected /testing route (3000)" });
});

router.get("/bugreports", passport.authenticate("jwt", { session: false }), (req, res) => {
  BugReport.find({})
    .then(async (bugReports) => {
      return res.status(200).send(bugReports);
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/bugreports/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  BugReport.findOne({id: req.params.id})
    .then(async (bugReport) => {
      if (!bugReport) {
        return res.status(404).send({ error: "BugReport doesn't exist!" });
      }
      return res.status(200).send(bugReport);
    })
    .catch((err) => {
      next(err);
    });
});

router.put("/bugreports/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  console.log(req);
  BugReport.findOne({id: req.params.id})
    .then(async (bugReport) => {
      if (!bugReport) {
        return res.status(404).send({ error: "BugReport doesn't exist!" });
      }

      if (req.body.title) {
        bugReport.title = req.body.title;
      }
      if (req.body.priority) {
        bugReport.priority = req.body.priority;
      }
      if (req.body.status) {
        bugReport.status = req.body.status;
      }
      if (req.body.description) {
        bugReport.description = req.body.description;
      }
      bugReport.updated = new Date();

      bugReport.save().then((bugReport) => {
        const success = "BugReport '" + bugReport.id + "' successfully updated!";
        res.status(200).json({msg: success});
      })
    })
    .catch((err) => { next(err); });
});

router.delete("/bugreports/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  BugReport.deleteOne({id: req.params.id})
  .then((result) => {
    if (result.deletedCount == 1) {
      const success = "BugReport '" + req.params.id + "' successfully deleted!";
      return res.status(200).send({msg: success});
    } else {
      return res.status(404).send({ error: "BugReport doesn't exist!" });
    }
  })
  .catch((err) => {
    next(err);
  });
});


router.post("/bugreports", passport.authenticate("jwt", { session: false }), (req, res) => {
  try {
    const newBugReport =  new BugReport({
      id: req.body.id,
      title: req.body.title,
      priority: req.body.priority,
      status: req.body.status,
      description: req.body.description,
      author: req.body.author,
      comments: req.body.comments,
      updates: req.body.updates,
      created: req.body.created,
      updated: req.body.updated,
    });

    console.log(req.body);
    console.log(newBugReport);

    newBugReport
      .save()
      .then((bugReport) => {
        const success = "BugReport '" + bugReport.id + "' successfully registered!";
        res.status(200).json({ msg: success });
      })
      .catch((err) => {
        if (err.name === "MongoServerError" && err.code === 11000) {
          res.status(409).send({ error: "User with this username already exists!" });
        } else {
          res.status(500).send(err.name + ": " + err.code);
        }
      });
  } catch (err) {
    res.status(500).send(err.name + ": " + err.code);
  }
})

// source: https://medium.com/@nil041297/mastering-role-based-authorization-in-your-mern-app-a-comprehensive-guide-with-jwt-and-passport-js-d7693143b33b
// Middleware function to check if the user has the required role(s)
// const checkUserRole = (requiredRoles) => (req, res, next) => {
//   if (req.user && requiredRoles.includes(req.user.role)) {
//     return next();
//   } else {
//     return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
//   }
// };

const checkRequiredUser = (requiredUser) => (req, res, next) => {
  if (req.user) {
    req.user.then((u) => {
      if (u.username === requiredUser) {
        return next();
      } else {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }    
    })
  }
}

router.get("/users", passport.authenticate("jwt", { session: false }), checkRequiredUser('admin'), (req, res) => {
  User.find({})
    .select(["-password", "-__v"])
    .then(async (users) => {
      return res.status(200).send(users);
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/users/:username", passport.authenticate("jwt", { session: false }), (req, res) => {
  User.findOne({username: req.params.username})
    .select(["-password", "-__v"])
    .then(async (user) => {
      if (!user) {
        return res.status(404).send({ error: "User doesn't exist!" });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      next(err);
    });
});

router.put("/users/:username", passport.authenticate("jwt", { session: false }), async (req, res) => {
  console.log(req.body);
	User.findOne({ username: req.params.username })
    .then(async (user) => {
      if (!user) {
        return res.status(404).send({ error: "User doesn't exist!" });
      }
  
      if (req.body.email) {
        user.email = req.body.email
      }
      if (req.body.firstName) {
        user.firstName = req.body.firstName
      }
      if (req.body.lastName) {
        user.lastName = req.body.lastName
      }

      user.save().then((user) => {
        const success = "User '" + user.username + "' successfully updated!";
        res.status(200).json({msg: success});
      })
    })
    .catch((err) => {next(err)});
});

router.delete("/users/:username", passport.authenticate("jwt", { session: false }), (req, res) => {
  User.deleteOne({username: req.params.username})
    .then((result) => {
      if (result.deletedCount == 1) {
        const success = "User '" + req.params.username + "' successfully deleted!";
        return res.status(200).send({msg: success});
      } else {
        return res.status(404).send({ error: "User doesn't exist!" });
      }
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
