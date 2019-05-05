/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const FxDesktopHelpers = require('./lib/fx-desktop');
const selectors = require('./lib/selectors');
const config = intern._config;
const ROOT_URL = config.fxaContentRoot;
const PAGE_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v1&service=sync';

let email;
const PASSWORD = '12345678';

const {
  thenify,
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  fillOutSignIn,
  fillOutSignInUnblock,
  noPageTransition,
  openPage,
  openVerificationLinkInDifferentBrowser,
  openVerificationLinkInNewTab,
  switchToWindow,
  testElementExists,
  visibleByQSA,
} = FunctionalHelpers;

const {
  listenForFxaCommands,
  testIsBrowserNotifiedOfMessage: testIsBrowserNotified,
  testIsBrowserNotifiedOfLogin
} = FxDesktopHelpers;

const setupTest = thenify(function (options) {
  options = options || {};

  const successSelector = options.blocked ? selectors.SIGNIN_UNBLOCK.HEADER :
    options.preVerified ? selectors.CONFIRM_SIGNIN.HEADER :
      selectors.CONFIRM_SIGNUP.HEADER;

  return this.parent
    .then(createUser(email, PASSWORD, { preVerified: !! options.preVerified }))
    .then(openPage(options.pageUrl || PAGE_URL, selectors.SIGNIN.HEADER))
    .execute(listenForFxaCommands)
    .then(fillOutSignIn(email, PASSWORD))
    .then(testElementExists(successSelector))
    .then(testIsBrowserNotified('can_link_account'))
    .then(() => {
      if (! options.blocked) {
        return this.parent
          .then(testIsBrowserNotifiedOfLogin(email, { expectVerified: false }));
      }
    });
});

registerSuite('Firefox Desktop Sync v1 signin', {
  beforeEach: function () {
    email = TestHelpers.createEmail('sync{id}');
    return this.remote
      .then(clearBrowserState({ force: true }));
  },
  tests: {
    'verified, verify same browser': function () {
      return this.remote
        .then(setupTest({preVerified: true}))

        .then(openVerificationLinkInNewTab(email, 0))
        .then(switchToWindow(1))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({preVerified: true}))

        .then(openVerificationLinkInDifferentBrowser(email))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER));
    },

    'verified, resend email, verify same browser': function () {
      return this.remote
        .then(setupTest({preVerified: true}))

        .then(click(selectors.CONFIRM_SIGNIN.LINK_RESEND))
        .then(visibleByQSA(selectors.CONFIRM_SIGNIN.RESEND_SUCCESS))

        // email 0 is the original signin email, open the resent email instead
        .then(openVerificationLinkInNewTab(email, 1))
        .then(switchToWindow(1))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER));
    },

    'verified, do not confirm signin, load root': function () {
      return this.remote
        .then(setupTest({preVerified: true}))

        .then(openPage(ROOT_URL, selectors.CONFIRM_SIGNIN.HEADER));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest({preVerified: false}));
    },

    'unverified, do not confirm signin, load root': function () {
      return this.remote
        .then(setupTest({preVerified: false}))

        .then(openPage(ROOT_URL, selectors.CONFIRM_SIGNUP.HEADER));
    },

    'verified, blocked': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(setupTest({blocked: true, preVerified: true}))

        .then(fillOutSignInUnblock(email, 0))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(testIsBrowserNotifiedOfLogin(email, {expectVerified: true}));
    }
  }
});
