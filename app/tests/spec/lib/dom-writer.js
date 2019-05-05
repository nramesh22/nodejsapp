/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const assert = require('chai').assert;
  const domWriter = require('lib/dom-writer');

  describe('lib/dom-writer', function () {
    var content = '<div id="stage-child">stage child content</div>';

    beforeEach(function () {
      $('#container').html('<div id="stage">stage content</div>');
    });

    describe('with text', function () {
      it('overwrite #stage with the html', function () {
        domWriter.write(window, content);

        assert.notInclude($('#stage').html(), 'stage content');
        assert.include($('#stage').html(), 'stage child content');
      });
    });

    describe('with a jQuery element', function () {
      it('overwrite #stage with the html', function () {
        domWriter.write(window, $(content));

        assert.notInclude($('#stage').html(), 'stage content');
        assert.include($('#stage').html(), 'stage child content');
      });
    });

  });
});
