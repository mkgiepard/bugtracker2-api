const mongoose = require("mongoose");

const BugReportComment = {
  author: String,
  comment: String,
  created: Date,
  updated: Date,
}

const BugReportUpdate = {
  author: String,
  comment: String,
  created: Date,
  updated: Date,
}

const BugReportSchema = new mongoose.Schema({
  id: Number,
  title: String,
  priority: Number,
  status: {
    type: String,
    enum : ['New', 'Assigned', 'Accepted', 'Fixed', 'WAI', 'WNF'],
    default: 'New'
    },
  description: String,
  author: String,
  comments: [BugReportComment],
  updates: [BugReportUpdate],
  created: Date,
  updated: Date,
});

mongoose.model("BugReport", BugReportSchema);
