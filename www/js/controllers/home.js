// Copyright (c) 2010-2018 The Bitcoin developers
// Original code was distributed under the MIT software license.
// Copyright (c) 2014-2018 TEDLab Sciences Ltd
// Tedchain code distributed under the GPLv3 license, see COPYING file.

var module = angular.module("TedchainWallet.Controllers");
var sdk = require("tedchain");
var Long = sdk.Long;

// ***** HomeController *****
// **************************

module.controller("HomeController", function ($scope, $rootScope, controllerService, $route, $q, walletSettings, endpointManager, TransactionBuilder, validator, AssetData) {

    if (!controllerService.checkState())
        return;

    $rootScope.selectedTab = "home";

    $scope.rootAccount = walletSettings.rootAccount.toString();
    $scope.rawAddress = walletSettings.derivedKey.privateKey.toAddress().toString();
    $scope.endpoints = endpointManager.endpoints;
    $scope.display = "home";
    $scope.fields = {
        "sendTo": "",
        "sendAmount": "",
        "routeTo": "",
        "memo": ""
    };

    // Load all assets in the account
    var balance = [];

    function loadEndpoint(key) {
        var endpoint = endpointManager.endpoints[key];
        var dataModel = {
            endpoint: endpoint,
            state: "loading",
            assets: []
        };
        balance.push(dataModel);
        endpoint.apiService.getAccountRecords(walletSettings.rootAccount).then(function (result) {
            for (var itemKey in result) {
                var assetData = new AssetData(endpoint, result[itemKey].asset);
                assetData.setAccountBalance(result[itemKey]);
                dataModel.assets.push(assetData);
            }

            dataModel.state = "loaded";
        }, function () {
            dataModel.state = "error";
        }).then(function () {
            return $q.all(dataModel.assets.map(function (asset) {
                return asset.fetchAssetDefinition();
            }));
        });
    }

    for (var key in endpointManager.endpoints) {
        loadEndpoint(key);
    }

    $scope.balance = balance;

    // Handle click on the asset item
    $scope.sendAsset = function (asset) {
        $scope.sendingAsset = asset;
        $scope.display = "send";
        $scope.asset = asset;
        $scope.sendStatus = "send-active";
    };

    // Handle sending the asset
    $scope.confirmSend = function (destinationField) {
        var sendAmount = Long.fromString($scope.fields.sendAmount);
        var endpoint = $scope.asset.endpoint;
        var asset = $scope.asset.currentRecord;

        var memo = $scope.fields.memo;
        var routing = $scope.fields.routeTo;

        var transaction = new TransactionBuilder(endpoint);

        if (memo != "" || routing != "") {
            var metadata = {};
            if (memo != "") {
                metadata.memo = memo;
            }

            if (routing != "") {
                metadata.routing = routing;
            }

            transaction.setMetadata(metadata);
        }

        transaction.addAccountRecord(asset, sendAmount.negate());
        transaction.updateAccountRecord($scope.fields.sendTo, asset.asset, sendAmount).then(function () {
            return transaction.uiSubmit(walletSettings.derivedKey);
        }, function () {
            destinationField.$setValidity("invalidValue", false);
        });
    };

    $scope.validateAmount = function (amountField) {
        amountField.$setValidity("invalidNumber", validator.isNumber($scope.fields.sendAmount));
    };

    $scope.cancelSend = function () {
        $route.reload();
    }
});
