#!/usr/bin/env node
const lib = require('../out/index');
const wxmlRoot = process.argv[2];
const workspaceRoot = process.argv[3];
console.log('wxml:', wxmlRoot, 'workspace:', workspaceRoot);
lib.run(wxmlRoot, workspaceRoot);