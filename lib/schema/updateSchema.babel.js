#!/usr/bin/env node
'use strict';

require('babel-register');
require('babel-polyfill');
require('./updateSchema').default();