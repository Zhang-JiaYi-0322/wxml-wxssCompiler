#!/usr/bin/env node
const lib = require('../out/index');
const wxssRoot = process.argv[2];
const workspaceRoot = process.argv[3];
lib.run(wxssRoot, workspaceRoot);