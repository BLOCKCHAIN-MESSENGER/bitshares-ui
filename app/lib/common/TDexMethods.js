import ls from "./localStorage";
import {tdexAPIs} from "api/apiConfig";

const tdexStorage = new ls("");

export function fetchCoinList(url = (tdexAPIs.BASE + tdexAPIs.COINS_LIST)) {
    return fetch(url, {method: "post"}).then(reply => reply.json().then(result => {
        return result;
    })).catch(err => {
        console.log("error fetching tdex list of coins", err, url);
    });
}

export function requestDepositAddress({inputCoinType, outputCoinType, outputAddress, url = tdexAPIs.BASE, account, user_id,stateCallback}) {
    let body = {
        inputCoinType,
        outputCoinType,
        outputAddress,
        account,
        user_id,
    };

    let body_string = JSON.stringify(body);
    return fetch(url + tdexAPIs.NEW_DEPOSIT_ADDRESS, {
        method: "post",
        headers: new Headers({"Accept": "application/json", "Content-Type": "application/json"}),
        body: body_string
    }).then(reply => {
        return reply.json()
            .then(json => {
                let address = {
                    "address": json.inputAddress || "unknown",
                    "memo": json.inputMemo,
                    error: json.error || null
                };
                if (stateCallback) stateCallback(address);
                return address;
            })
            .catch(error => {
                console.error("error: ", error);
                if (stateCallback) stateCallback({"address": "unknown", "memo": null});
                return Promise.reject({"address": "unknown", "memo": null});

            });
    }).catch(err => {
        console.log("fetch error:", err);
        return Promise.reject({"address": "unknown", "memo": null});

    });
}

export function validateAddress({url = tdexAPIs.BASE, walletType, newAddress}) {
    if (!newAddress) return new Promise((res) => res());
    return fetch(
        url + "/wallets/" + walletType + "/check-address",
        {
            method: "post",
            headers: new Headers({"Accept": "application/json", "Content-Type": "application/json"}),
            body: JSON.stringify({address: newAddress})
        }).then(reply => reply.json().then(json => json.isValid))
        .catch(err => {
            console.log("validate error:", err);
        })
}

function hasWithdrawalAddress(wallet) {
    return tdexStorage.has(`history_address_${wallet}`);
}

function setWithdrawalAddresses({wallet, addresses}) {
    tdexStorage.set(`history_address_${wallet}`, addresses);
}

function getWithdrawalAddresses(wallet) {
    return tdexStorage.get(`history_address_${wallet}`, []);
}

function setLastWithdrawalAddress({wallet, address}) {
    tdexStorage.set(`history_address_last_${wallet}`, address);
}

function getLastWithdrawalAddress(wallet) {
    return tdexStorage.get(`history_address_last_${wallet}`, "");
}

export const WithdrawAddresses = {
    has: hasWithdrawalAddress,
    set: setWithdrawalAddresses,
    get: getWithdrawalAddresses,
    setLast: setLastWithdrawalAddress,
    getLast: getLastWithdrawalAddress
};
