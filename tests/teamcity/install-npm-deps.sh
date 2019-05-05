#!/usr/bin/env sh

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

export NPM_CONFIG_LOGLEVEL=warn

node ./tests/teamcity/install-npm-deps.js \
  convict                         \
  css                             \
  extend                          \
  firefox-profile                 \
  fxa-js-client                   \
  fxa-geodb                       \
  fxa-shared                      \
  got                             \
  helmet                          \
  htmlparser2                     \
  intern                          \
  joi                             \
  js-md5                          \
  leadfoot                        \
  lodash                          \
  morgan                          \
  mozlog                          \
  node-uap                        \
  node-uuid                       \
  on-headers                      \
  otplib                          \
  proxyquire                      \
  raven                           \
  request                         \
  request-promise                 \
  sinon                           \
  underscore                      \
  xmlhttprequest                  \
  yargs
