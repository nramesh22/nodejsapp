/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * V1 of the broker to communicate with Fx Desktop when signing in to Sync.
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const FxDesktopChannel = require('../../lib/channels/fx-desktop-v1');
  const FxSyncChannelAuthenticationBroker = require('../auth_brokers/fx-sync-channel');
  const HaltBehavior = require('../../views/behaviors/halt');
  const Url = require('../../lib/url');

  var proto = FxSyncChannelAuthenticationBroker.prototype;

  var FxDesktopV1AuthenticationBroker = FxSyncChannelAuthenticationBroker.extend({
    type: 'fx-desktop-v1',

    commands: {
      CAN_LINK_ACCOUNT: 'can_link_account',
      CHANGE_PASSWORD: 'change_password',
      DELETE_ACCOUNT: 'delete_account',
      LOADED: 'loaded',
      LOGIN: 'login'
    },

    defaultBehaviors: _.extend({}, proto.defaultBehaviors, {
      // about:accounts displays its own screen after sign in, no need
      // to show anything.
      afterForceAuth: new HaltBehavior(),
      // about:accounts displays its own screen after password reset, no
      // need to show anything.
      afterResetPasswordConfirmationPoll: new HaltBehavior(),
      // about:accounts displays its own screen after sign in, no need
      // to show anything.
      afterSignIn: new HaltBehavior(),
      // about:accounts displays its own screen after sign in, no need
      // to show anything.
      afterSignInConfirmationPoll: new HaltBehavior(),
      // about:accounts displays its own screen after sign in, no need
      // to show anything.
      afterSignUpConfirmationPoll: new HaltBehavior()
    }),

    createChannel () {
      var channel = new FxDesktopChannel();

      channel.initialize({
        // Fx Desktop browser will send messages with an origin of the string
        // `null`. These messages are trusted by the channel by default.
        //
        // 1) Fx on iOS and functional tests will send messages from the
        // content server itself. Accept messages from the content
        // server to handle these cases.
        // 2) Fx 18 (& FxOS 1.*) do not support location.origin. Build the origin from location.href
        origin: this.window.location.origin || Url.getOrigin(this.window.location.href),
        window: this.window
      });

      channel.on('error', this.trigger.bind(this, 'error'));

      return channel;
    },

    afterResetPasswordConfirmationPoll (account) {
      // We wouldn't expect `customizeSync` to be set when completing
      // a password reset, but the field must be present for the login
      // message to be sent. false is the default value set in
      // lib/fxa-client.js if the value is not present.
      // See #5528
      if (! account.has('customizeSync')) {
        account.set('customizeSync', false);
      }

      // Only fx-desktop-v1 based integrations send a login message
      // after reset password complete, assuming the user verifies
      // in the same browser. fx-desktop-v1 based integrations
      // do not support WebChannels, and the login message must be
      // sent within about:accounts for the browser to receive it.
      // Integrations that support WebChannel messages will send
      // the login message from the verification tab, and for users
      // of either integration that verify in a different browser,
      // they will be asked to signin in this browser using the
      // new password.
      return this._notifyRelierOfLogin(account)
        .then(() => proto.afterResetPasswordConfirmationPoll.call(this, account));
    }
  });

  module.exports = FxDesktopV1AuthenticationBroker;
});

