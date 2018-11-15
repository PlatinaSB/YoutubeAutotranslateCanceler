// ==UserScript==
// @name         Youtube title translate reverser
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Pierre Couy
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /*
    Get a YouTube Data v3 API key from https://console.developers.google.com/apis/library/youtube.googleapis.com?q=YoutubeData
    */
    const API_KEY = "YOUR API_KEY HERE";
    
    
    const url_template = "https://www.googleapis.com/youtube/v3/videos?part=snippet&id={IDs}&key=" + API_KEY;

    var alreadyChanged = [];

    function changeTitles(){
        var links = Array.prototype.slice.call(document.getElementsByTagName("a")).filter( a => {
            return a.id == 'video-title' && alreadyChanged.indexOf(a) == -1;
        } );
        var spans = Array.prototype.slice.call(document.getElementsByTagName("span")).filter( a => {
            return a.id == 'video-title' && alreadyChanged.indexOf(a) == -1;
        } );
        links = links.concat(spans);

        if(links.length > 0){
            console.log('Changing titles');
            var IDs = links.map( a => {
                while(a.tagName != "A"){
                    a = a.parentNode;
                }
                var href = a.href;
                var tmp = href.split('v=')[1];
                return tmp.split('&')[0];
            } );
            console.log(links);

            var requestUrl = url_template.replace("{IDs}", IDs.join(','));

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    var data = JSON.parse(xhr.responseText);
                    if(data.kind == "youtube#videoListResponse"){
                        data = data.items;
                        var titleStore = {}
                        data = data.forEach( v => {
                            titleStore[v.id] = v.snippet.title;
                        } );
                        console.log(titleStore);
                        for(var i=0 ; i < links.length ; i++){
                            if(titleStore[IDs[i]] !== undefined){
                                links[i].innerText = titleStore[IDs[i]];
                                alreadyChanged.push(links[i]);
                            }
                        }
                    }else{
                        console.log(requestUrl);
                        console.log(data);
                    }
                }
            };
            xhr.open('GET', requestUrl);
            xhr.send();
        }
    }
    changeTitles();
    var obs = new MutationObserver(changeTitles);
    obs.observe(document.body, {childList: true, subtree: true});

})();
