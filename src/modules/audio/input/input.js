/*
//  input.js
//
//  Created by Kalila L. on May 11th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

const AudioInput = (function () {
    function requestInputAccess () {
        return navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    }

    return {
        requestInputAccess
    };
}());

export default AudioInput;