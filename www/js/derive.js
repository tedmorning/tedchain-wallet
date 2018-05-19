// Copyright (c) 2010-2018 The Bitcoin developers
// Original code was distributed under the MIT software license.
// Copyright (c) 2014-2018 TEDLab Sciences Ltd
// Tedchain code distributed under the GPLv3 license, see COPYING file.

self.addEventListener("message", function (e) {

    window = {};
    window.Object = Object;
    window.String = String;
    window.RegExp = RegExp;
    window.Math = Math;
    window.Function = Function;
    window.Array = Array;
    window.Date = Date;
    window.parseInt = parseInt;
    window.parseFloat = parseFloat;

    importScripts("../bower_components/bitcore-lib/bitcore-lib.js");
    importScripts("../bower_components/bitcore-mnemonic/bitcore-mnemonic.js");

    var bitcore = require("bitcore-lib");
    var Mnemonic = require("bitcore-mnemonic");

    var code = new Mnemonic(e.data.mnemonic);
    var derivedKey = code.toHDPrivateKey(null, "livenet");
    self.postMessage(derivedKey.xprivkey);

}, false);