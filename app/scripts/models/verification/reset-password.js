/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model to hold reset password verification data
 */

define(function (require, exports, module) {
  'use strict';

  const Vat = require('../../lib/vat');
  const VerificationInfo = require('./base');

  module.exports = VerificationInfo.extend({
    defaults: {
      code: null,
      email: null,
      token: null
    },

    validation: {
      code: Vat.verificationCode().required(),
      email: Vat.email().required(),
      emailToHashWith: Vat.email().optional(),
      token: Vat.token().required(),
      uid: Vat.hex().optional()
    }
  });
});

