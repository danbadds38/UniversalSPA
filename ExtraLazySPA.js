/**
 * The purpose of this file is to fetch all relative paths to the current context
 * > Pre-Fetch & Initialize The Content.
 * > Associate The Content With A HashID
 * > Associate The Link To Correspond With The HashID
 * > $.onClick() of the element should load that content
 * > $.onClick() Should Perform A Browser Push State To History
 * > Back & Forward Buttons Should Work As Per Normal
 *
 * -- TODO List --
 * @todo scrape all relative urls
 * @todo pre-load content
 * @todo associate each content to a specific hash
 * @todo add to all references to the same content the same hash (so we're not loading duplicates)
 * @todo add resource link to initial page & content
 *
 * -- Wish List --
 * @todo Scan All Web Relative Web Pages Recursively & Pre-Load Into The Browser
 * @todo Make Sure Clicking The Refresh Button Hard Reloads The DOM & Potentially Trigger A Refresh Of All Links
 *
 * -- MANDITORY --
 * @todo Add Global Try-Catch To Fallback To Hard Link If Service Fails [remove e.preventDefault()] $.onClick() EventListeners
 * @todo Add GreyLog|Splunk Abilities To Log When LazyLinking Fails ... ?gl=<idHash>&splunk=<idHash> <-- Params Can Be Set As $_GET params
 * @todo Give CSS Selector Option To Explicitly Set or Deny Links (ex: login|logout) may cause disruption with sessions
 * @todo Needs To Check Against Shared LocalStorage Values To Prevent Duplicate Loading In ShadowDOM Nodes
 *
 * @type {{init: ExtraLazySPA.init}}
 */
let ExtraLazySPA = function($) {
    'use strict';

    let links = [], content;

    /**
     * This will store the shared resource links between Tabs
     * *
     * @param links
     * @private
     */
    let _setSharedLinks = function(links) {
        console.log('_setSharedLinks()');
        console.log(links);
        localStorage.setItem('extra_lazy_spa_links', JSON.stringify(links));
    };

    /**
     * This will fetch the shared resource links between Tabs
     *
     * @private
     */
    let _getSharedLinks = function() {
        let tmp = JSON.parse(localStorage.getItem('extra_lazy_spa_links'));
        console.log('_getSharedLinks()');
        console.log(tmp);
        return tmp === null ? (links.length > 0 ? links : []) : links = tmp;
    };

    /**
     * This will set the shared resource between Tabs
     *
     * @param resource
     * @private
     */
    let _setSharedContent = function(resource) {
        localStorage.setItem('extra_lazy_spa_content',JSON.stringify(resource));
    };

    /**
     * This will fetch the shared resource between Tabs
     *
     * @private
     */
    let _getSharedContent = function() {
        return content = JSON.parse(localStorage.getItem('extra_lazy_spa_content'));
    };

    /**
     * ASYNC - URL Content Fetching
     *
     * @param url
     * @private
     */
    let _client = function(url) {
        let uuid = _getUUID();
        let xhttp = new XMLHttpRequest();

        // on completion event listener
        xhttp.onreadystatechange = function() {
            try {
                console.log(url);
                if (this.readyState === 4 && this.status === 200) {
                    // create new shadow-dom node
                    // hide-content by default
                    let container = document.createElement('div').attachShadow({
                        mode: 'open'
                    });

                    container.setAttribute('id', uuid);

                    // set shadow-dom element
                    document.getElementById(uuid).innerHTML = xhttp.responseText;

                    // set the internal compass
                    content[uuid] = document.getElementById(uuid);
                }
            } catch(error) {
                console.log(error);
            }

        };

        if(url !== 'undefined' && url !== "" && url !== "javascript:;") {
            // make request
            xhttp.open("GET", url, true);
            try {
                xhttp.send();
            } catch (error) {
                console.log(error);
            }
        }
    };

    /**
     * RFC4122 Compliant UUID Signature
     *
     * @link https://www.ietf.org/rfc/rfc4122.txt
     * @link https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
     * @link https://gist.github.com/jed/982883
     *
     * @private
     */
    let _getUUID = function() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    };

    /**
     *
     *
     * @param link
     * @private
     */
    let _checkIsLocalURI = function(link) {
        console.log(link);
        return link.host === window.location.host && link.pathname !== 'undefined';
    };

    /**
     * This will see if the content already exists in localStorage
     *
     * @param link
     * @private
     *
     * @return boolean
     * @todo write this logic out .... lolz
     */
    let _isLinkAlreadyLoaded = function(link) {
        _getSharedLinks();
        if(links !== null)
            for(let i = 0; i < links.length; i++) {
                if(links[i].pathname === link.pathname) {
                    return true;
                }
            }

        return false;
    };

    /**
     * Check The Element If Hard Reload Is Specified To *Ignore*
     *
     * @param link
     * @private
     */
    let _checkIfHardLoad = function(link) {
        return link.hasAttribute("hard-load") || link.hasAttribute('ignore-me');
    };

    /**
     * Grab all of the relative paths
     * @private
     */
    let _grabAllRelativeLinksOnPage = function() {
        let tmp = document.links;
        for(let i = 0; i < tmp.length; i++) {
            if(_checkIsLocalURI(tmp[i]) && !_checkIfHardLoad(tmp[i]) && !_isLinkAlreadyLoaded(tmp[i]) ) {
                links.push(tmp[i]);
                _setSharedLinks(links);
            }
        }
        console.log(tmp);
        console.log(links);
    };

    /**
     * Will Load Content Into Shadow DOM Nodes Associated By The <HashID> Parent
     * > Store In Local Storage
     *
     * @private
     */
    let _fetchContent = function() {
        for(let i = 0; i < links.length; i++) {
            _client(links[i].pathname);
        }
    };

    /**
     * This will Map The Content To Their Corresponding Links
     * @private
     */
    let _associateContentToLinks = function() {

    };

    /**
     * This will associate a $.onClick() Event Handler For The links
     * > e.preventDefault()
     *
     * @private
     */
    let _associateOnClickEventHandlers = function() {

    };

    /**
     * This will remove local resource linking & unset event listeners
     *
     * @note Hard Reloading Will Occur Unless Link Clicked Has Been Pre-Fetched In Time
     * @private
     */
    let _bustCache = function() {
        localStorage.setItem('extra_lazy_spa_links','{}');
        localStorage.setItem('extra_lazy_spa_content','{}');
        links = [];
        content = [];
    };

    /**
     *
     * @constructor
     */
    let Main = function() {
        _grabAllRelativeLinksOnPage();
        _fetchContent();
        _associateContentToLinks();
        _associateOnClickEventHandlers();
    };


    /**
     * API Commands
     * - init() Will Initialize The Whole Module *Generally Run At Least Once A Full Page Load*
     * - refresh() Allows You To Bust All Local Storage & Caching Mechanisms Full Force A Full Reload
     */
    return {
        init: function(){
            Main();
        },
        refresh: function() {
            _bustCache();
            this.init();
        }
    }
}(jQuery);
/** Initialize Module **/
ExtraLazySPA.init();