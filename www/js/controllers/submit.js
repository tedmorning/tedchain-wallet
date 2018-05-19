// Copyright (c) 2010-2018 The Bitcoin developers
// Original code was distributed under the MIT software license.
// Copyright (c) 2014-2018 TEDLab Sciences Ltd
// Tedchain code distributed under the GPLv3 license, see COPYING file.

var module = angular.module("TedchainWallet.Controllers");
var sdk = require("tedchain");

// ***** SubmitController *****
// ****************************

module.controller("SubmitController", function ($scope, $rootScope, $location, controllerService) {

    if (!controllerService.checkState())
        return;

    var transaction = $rootScope.submitTransaction;
    $rootScope.submitTransaction = null;

    if (transaction == null) {
        $scope.display = "error";
        $scope.error = "ConnectionError";
    }
    else {
        $scope.display = "pending";

        var signer = new sdk.MutationSigner(transaction.key);

        transaction.transaction.addSigningKey(signer).submit()
            .then(function (response) {
                $scope.display = "success";
                $scope.transactionHash = response["transaction_hash"];
                $scope.mutationHash = response["mutation_hash"];
            }, function (response) {
                $scope.display = "error";

                if (response.status == 400) {
                    $scope.error = response.data["error_code"];
                } else {
                    $scope.error = "Unknown";
                }
            });
    }

    $scope.cancelSend = function () {
        $location.path("/");
        return;
    }
});
