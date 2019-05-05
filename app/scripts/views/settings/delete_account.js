/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('../../lib/auth-errors');
  const Cocktail = require('cocktail');
  const FormView = require('../form');
  const PasswordMixin = require('../mixins/password-mixin');
  const ServiceMixin = require('../mixins/settings-panel-mixin');
  const Session = require('../../lib/session');
  const SettingsPanelMixin = require('../mixins/service-mixin');
  const Template = require('templates/settings/delete_account.mustache');

  const t = msg => msg;

  var View = FormView.extend({
    template: Template,
    className: 'delete-account',
    viewName: 'settings.delete-account',

    setInitialContext (context) {
      context.set('email', this.getSignedInAccount().get('email'));
    },

    submit () {
      var account = this.getSignedInAccount();
      var password = this.getElementValue('.password');

      return this.user.deleteAccount(account, password)
        .then(() => {
          Session.clear();
          return this.invokeBrokerMethod('afterDeleteAccount', account);
        })
        .then(() => {
          // user deleted an account
          this.logViewEvent('deleted');

          this.navigate('signup', {
            success: t('Account deleted successfully')
          }, {
            clearQueryParams: true,
          });
        })
        .catch((err) => {
          if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
            return this.showValidationError(this.$('#password'), err);
          }
          throw err;
        });
    }
  });

  Cocktail.mixin(
    View,
    PasswordMixin,
    SettingsPanelMixin,
    ServiceMixin,
  );

  module.exports = View;
});

