/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in Firefox for Android.
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const FxSyncWebChannelAuthenticationBroker = require('../auth_brokers/fx-sync-web-channel');

  var proto = FxSyncWebChannelAuthenticationBroker.prototype;

  var FxFennecV1AuthenticationBroker = FxSyncWebChannelAuthenticationBroker.extend({
    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      browserTransitionsAfterEmailVerification: false,
      chooseWhatToSyncCheckbox: false,
      chooseWhatToSyncWebV1: true,
      emailVerificationMarketingSnippet: false
    }),

    type: 'fx-fennec-v1'
  });

  module.exports = FxFennecV1AuthenticationBroker;
});
