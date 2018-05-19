// Copyright (c) 2010-2018 The Bitcoin developers
// Original code was distributed under the MIT software license.
// Copyright (c) 2014-2018 TEDLab Sciences Ltd
// Tedchain code distributed under the GPLv3 license, see COPYING file.

var module = angular.module("TedchainWallet.Controllers");
var bitcore = require("bitcore-lib");
var Mnemonic = require("bitcore-mnemonic");

module.controller("SignInController", function ($scope, $rootScope, $location, endpointManager, controllerService, walletSettings) {

    if (!controllerService.checkState())
        return;

    var loadingEndpoints = endpointManager.loadEndpoints();

    $rootScope.selectedTab = "none";

    var generatedMnemonic = new Mnemonic();
    $scope.properties = { seed: "" };
    $scope.display = "signin";

    $scope.generate = function () {
        var generatedMnemonic = new Mnemonic();
        $scope.passphrase = generatedMnemonic.toString();
        $scope.display = "passphrase";
    };

    $scope.back = function () {
        $scope.display = "signin";
    };

    $scope.submit = function () {

        if (Mnemonic.isValid($scope.properties.seed)) {

            var worker = new Worker("js/derive.js");

            worker.addEventListener("message", function (hdKey) {
                $rootScope.$apply(function () {
                    var hdPrivateKey = new bitcore.HDPrivateKey(hdKey.data);
                    hdPrivateKey.network = bitcore.Networks.get("tedchain");
                    walletSettings.setRootKey(hdPrivateKey);

                    loadingEndpoints.then(function () {
                        $location.path("/");
                    });
                })
            }, false);

            worker.postMessage({ mnemonic: $scope.properties.seed });

            $scope.display = "loading";
        }
        else {
            $scope.properties.signinForm.seed.$setValidity("invalidSeed", false);
        }
    };
});
