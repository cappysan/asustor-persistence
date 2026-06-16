/* Copyright (c) 2026 Cappysan. All rights reserved. */

Ext.define('AS.ARC.apps.persistence.core', {
    extend: 'Ext.util.Observable',

    apiUrl:  AS.ARC.util.getUserAppsPath() + 'cappysan-persistence/' + 'persistence.cgi',
    imgUrl:  AS.ARC.util.getUserAppsPath() + 'cappysan-persistence/images/',

    constructor: function (config) {
        Ext.apply(this, config);
        this.callParent();
        this.init(config);
    },

    init: function () {
        var fn = this;

        fn.win = fn.desktop.createWindow({
            app:       fn.app,
            id:        fn.id,
            itemId:    fn.id,
            title:     '<div class="as-header" style="background-image:url(' + AS.ARC.util.fixDc('/apps/cappysan-persistence/images/icon-app-task.png') + ');background-position:50%;background-repeat:no-repeat;"></div><div class="as-header-text">Persistence</div>',

            width:     700,
            height:    500,
            minWidth:  700,
            minHeight: 500,
            resizable: true,
            border:    false,
            layout:    'fit',
            items:     [fn.getMainPanel()],
            listeners: {
                afterrender: function (win) {
                    win.header.items.items[1].hide();
                    fn.navGrid.getSelectionModel().select(0);
                },
                resize: function (win) {
                    fn.resizeResultTextarea();
                }
            }
        });
    },

    resizeResultTextarea: function () {
        var fn       = this,
            win      = fn.win,
            textarea = win.down('textarea[readOnly=true]');

        if (!textarea) { return; }

        var winHeight    = win.getHeight(),
            taEl         = textarea.el,
            taTop        = taEl ? taEl.getTop() : 0,
            winTop       = win.el.getTop(),
            headerHeight = win.header ? win.header.getHeight() : 0,
            footerHeight = 40,
            padding      = 16,
            newHeight    = winHeight - (taTop - winTop) - footerHeight - padding;

        if (newHeight > 60) {
            textarea.setHeight(newHeight);
        }
    },

    getNavGrid: function () {
        var fn = this;

        fn.navGrid = Ext.create('Ext.grid.Panel', {
            itemId: 'navGrid',
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['title', 'tabId'],
                data: [
                    [_S('PERSISTENCE', 'TAB_DNS'),    'dns'],
                    [_S('PERSISTENCE', 'TAB_DOCKER'), 'docker'],
                    [_S('PERSISTENCE', 'TAB_HOSTS'),  'hosts']
                ]
            }),
            hideHeaders: true,
            height:      '100%',
            border:      false,
            columns: [{
                flex:     1,
                renderer: function (v, metadata, record) {
                    var _p = AS.ARC.util.getUserAppsPath() + 'cappysan-persistence/images/';
                    var icons = {
                        dns:    AS.ARC.util.fixDc('apps/settings/images/icon-fn-network.png'),
                        docker: AS.ARC.util.fixDc('/apps/cappysan-persistence/images/icon-fn-docker.png'),
                        hosts:  AS.ARC.util.fixDc('apps/ezSync/images/icon-fn-file.png')
                    };
                    var iconUrl = icons[record.data.tabId] || icons.dns;
                    return '<div class="fn-block">' +
                           '<div class="fn-icon" style="background-image:url(' + iconUrl + ');background-repeat:no-repeat;background-position:center center;background-size:contain;"></div>' +
                           '<div class="fn-title" style="width:130px;opacity:1;">' + record.data.title + '</div>' +
                           '<div class="x-clear"></div>' +
                           '</div>';
                }
            }],
            listeners: {
                selectionchange: function (model, selections) {
                    if (selections.length > 0) {
                        fn.switchTab(selections[0].get('tabId'));
                    }
                }
            }
        });

        return fn.navGrid;
    },

    switchTab: function (tabId) {
        var fn        = this,
            cardPanel = fn.win.down('#cardPanel');

        fn.win.el.mask(_S('COMMON', 'LOADING'));

        AS.ARC.ajax({
            url:    AS.ARC.util.getApiUrlWithSid(fn.apiUrl, { act: 'get', tab: tabId }),
            method: 'post',
            success: function (json) {
                fn.win.el.unmask();
                cardPanel.removeAll();
                if (tabId === 'dns')    { fn.renderDnsTab(cardPanel, json); }
                if (tabId === 'docker') { fn.renderDockerTab(cardPanel, json); }
                if (tabId === 'hosts')  { fn.renderHostsTab(cardPanel, json); }
                Ext.defer(function () { fn.resizeResultTextarea(); }, 150);
            },
            failure: function (json) {
                fn.win.el.unmask();
                AS.ARC.util.showMsgWindow({ 5000: _S('COMMON', 'SESSION_TIMEOUT') }, json, fn.win);
            }
        });
    },

    /* ── DNS tab ────────────────────────────────────────────────────────── */
    renderDnsTab: function (cardPanel, json) {
        var fn         = this,
            labelWidth = 120;

        cardPanel.add(Ext.create('Ext.panel.Panel', {
            cls:    'as-page-panel app-cappysan-persistence',
            border: false,
            layout: 'anchor',
            defaults: { anchor: '100%' },
            items: [{
                xtype:    'fieldset',
                title:    _S('PERSISTENCE', 'SECTION_ASUSTOR_RO'),
                defaults: { anchor: '100%', msgTarget: AS.ARC.config.msgTarget },
                items: [{
                    xtype:      'textfield',
                    fieldLabel: AS.ARC.util.fontToBold(_S('PERSISTENCE', 'LABEL_DOMAIN_DNS')),
                    labelWidth: labelWidth,
                    itemId:     'dnsDomainDns',
                    readOnly:   true,
                    cls:        'persistence-readonly',
                    anchor:     '100%',
                    value:      json.domain_dns || ''
                }, {
                    xtype:      'textfield',
                    fieldLabel: AS.ARC.util.fontToBold(_S('PERSISTENCE', 'LABEL_PRIMARY_DNS')),
                    labelWidth: labelWidth,
                    itemId:     'dnsPrimaryDns',
                    readOnly:   true,
                    cls:        'persistence-readonly',
                    anchor:     '100%',
                    value:      json.primary_dns || ''
                }, {
                    xtype:      'textfield',
                    fieldLabel: AS.ARC.util.fontToBold(_S('PERSISTENCE', 'LABEL_SECONDARY_DNS')),
                    labelWidth: labelWidth,
                    itemId:     'dnsSecondaryDns',
                    readOnly:   true,
                    cls:        'persistence-readonly',
                    anchor:     '100%',
                    value:      json.secondary_dns || ''
                }, {
                    xtype:   'box',
                    autoEl:  { tag: 'div' },
                    style:   'margin-top: 8px;',
                    html:    '<a href="#" class="persistence-settings-link">' + _S('PERSISTENCE', 'LINK_NETWORK_SETTINGS') + '</a>',
                    listeners: {
                        render: function (box) {
                            box.el.on('click', function (e) {
                                e.preventDefault();
                                AS.ARC.core.openApp('app-settings', 'network');
                            }, null, { delegate: 'a' });
                        }
                    }
                }]
            }, {
                xtype:    'fieldset',
                title:    _S('PERSISTENCE', 'SECTION_CUSTOM'),
                defaults: { anchor: '100%', msgTarget: AS.ARC.config.msgTarget },
                items: [{
                    xtype:      'textfield',
                    fieldLabel: AS.ARC.util.fontToBold(_S('PERSISTENCE', 'LABEL_SEARCH')),
                    labelWidth: labelWidth,
                    itemId:     'dnsSearch',
                    anchor:     '100%',
                    value:      json.search_val || ''
                }]
            }, {
                xtype:    'fieldset',
                title:    _S('PERSISTENCE', 'SECTION_RESULT'),
                defaults: { anchor: '100%' },
                items: [{
                    xtype: 'displayfield',
                    value: 'Contents of /etc/resolv.conf:'
                }, {
                    xtype:      'textarea',
                    anchor:     '100%',
                    height:     140,
                    readOnly:   true,
                    cls:        'persistence-conf-view',
                    value:      json.system_content || ''
                }]
            }],
            dockedItems: [{
                xtype: 'toolbar',
                dock:  'bottom',
                ui:    'footer',
                items: [
                    { xtype: 'component', flex: 1 },
                    {
                        xtype:   'button',
                        text:    _S('COMMON', 'APPLY'),
                        handler: function () { fn.saveDnsTab(); }
                    }
                ]
            }]
        }));
    },

    saveDnsTab: function () {
        var fn          = this,
            search      = fn.win.down('#dnsSearch'),
            domainDns   = fn.win.down('#dnsDomainDns'),
            primaryDns  = fn.win.down('#dnsPrimaryDns'),
            secondaryDns = fn.win.down('#dnsSecondaryDns');

        fn.win.el.mask(_S('COMMON', 'APPLYING'));
        AS.ARC.ajax({
            url:    AS.ARC.util.getApiUrlWithSid(fn.apiUrl, { act: 'set', tab: 'dns' }),
            method: 'post',
            params: {
                search:       search       ? search.getValue()       : '',
                primary_dns:  primaryDns   ? primaryDns.getValue()   : '',
                secondary_dns: secondaryDns ? secondaryDns.getValue() : ''
            },
            success: function () {
                fn.win.el.unmask();
                AS.ARC.ajax({
                    url:    AS.ARC.util.getApiUrlWithSid(fn.apiUrl, { act: 'restart' }),
                    method: 'post',
                    success: function () { fn.switchTab('dns'); },
                    failure: function () { fn.switchTab('dns'); }
                });
            },
            failure: function (json) {
                fn.win.el.unmask();
                AS.ARC.util.showMsgWindow({ 5000: _S('COMMON', 'SESSION_TIMEOUT') }, json, fn.win);
            }
        });
    },

    /* ── Docker tab ─────────────────────────────────────────────────────── */
    renderDockerTab: function (cardPanel, json) {
        var fn  = this,
            cfg = {};

        // Parse existing daemon.json content
        if (json.content) {
            try { cfg = Ext.decode(json.content); } catch (e) { cfg = {}; }
        }

        var logOpts   = cfg['log-opts'] || {};
        var lw        = 160;

        cardPanel.add(Ext.create('Ext.panel.Panel', {
            cls:    'as-page-panel app-cappysan-persistence',
            border: false,
            layout: 'anchor',
            defaults: { anchor: '100%' },
            items: [{
                xtype:    'fieldset',
                title:    'daemon.json',
                defaults: { anchor: '100%', msgTarget: AS.ARC.config.msgTarget },
                items: [{
                    xtype:      'combo',
                    fieldLabel: AS.ARC.util.fontToBold('log-driver'),
                    labelWidth: lw,
                    itemId:     'dockerLogDriver',
                    store:      ['local'],
                    editable:   false,
                    value:      cfg['log-driver'] || 'local',
                    anchor:     '100%'
                }, {
                    xtype:      'container',
                    layout:     'hbox',
                    anchor:     '100%',
                    items: [{
                        xtype:     'displayfield',
                        value:     AS.ARC.util.fontToBold('log-opts.max-size'),
                        width:     lw,
                        style:     'padding-top:3px;'
                    }, {
                        xtype:         'numberfield',
                        itemId:        'dockerMaxSizeNum',
                        minValue:      0,
                        flex:          1,
                        allowDecimals: false,
                        value:         (function() {
                            var v = logOpts['max-size'] || '';
                            return parseInt(v, 10) || 0;
                        }())
                    }, {
                        xtype:    'combo',
                        itemId:   'dockerMaxSizeUnit',
                        store:    ['m', 'g'],
                        editable: false,
                        width:    55,
                        value:    (function() {
                            var v = logOpts['max-size'] || '';
                            return v && v.slice(-1) === 'g' ? 'g' : 'm';
                        }())
                    }]
                }, {
                    xtype:      'numberfield',
                    fieldLabel: AS.ARC.util.fontToBold('log-opts.max-file'),
                    labelWidth: lw,
                    itemId:     'dockerMaxFile',
                    minValue:   1,
                    maxValue:   30,
                    value:      parseInt(logOpts['max-file'], 10) || 7,
                    anchor:     '100%'
                }, {
                    xtype:      'checkboxfield',
                    fieldLabel: AS.ARC.util.fontToBold('live-restore'),
                    labelWidth: lw,
                    itemId:     'dockerLiveRestore',
                    anchor:     '100%',
                    checked:    cfg['live-restore'] === true
                }]
            }, {
                xtype:    'fieldset',
                title:    _S('PERSISTENCE', 'SECTION_RESULT'),
                defaults: { anchor: '100%' },
                items: [{
                    xtype: 'displayfield',
                    value: 'Contents of /etc/docker/daemon.json:'
                }, {
                    xtype:      'textarea',
                    anchor:     '100%',
                    height:     140,
                    readOnly:   true,
                    cls:        'persistence-conf-view',
                    value:      json.system_content || ''
                }]
            }],
            dockedItems: [{
                xtype: 'toolbar',
                dock:  'bottom',
                ui:    'footer',
                items: [
                    { xtype: 'component', flex: 1 },
                    {
                        xtype:   'button',
                        text:    _S('COMMON', 'APPLY'),
                        handler: function () { fn.saveDockerTab(); }
                    }
                ]
            }]
        }));
    },

    saveDockerTab: function () {
        var fn          = this,
            logDriver   = fn.win.down('#dockerLogDriver'),
            maxSizeNum  = fn.win.down('#dockerMaxSizeNum'),
            maxSizeUnit = fn.win.down('#dockerMaxSizeUnit'),
            maxFile     = fn.win.down('#dockerMaxFile'),
            liveRestore = fn.win.down('#dockerLiveRestore');

        // Validate fields
        var sizeNum = maxSizeNum.getValue();
        if (sizeNum === null || sizeNum === '' || isNaN(sizeNum) || sizeNum < 0) {
            maxSizeNum.markInvalid('Must be a number >= 0');
            return;
        }
        var fileNum = maxFile.getValue();
        if (fileNum === null || fileNum < 1 || fileNum > 30) {
            maxFile.markInvalid('Must be between 1 and 30');
            return;
        }

        var cfg = {
            'log-driver': logDriver.getValue(),
            'log-opts': {
                'max-size': String(parseInt(sizeNum, 10)) + maxSizeUnit.getValue(),
                'max-file': String(parseInt(fileNum, 10))
            },
            'live-restore': liveRestore.getValue() === true
        };

        // Pretty-print matching the sample format
        var content = JSON.stringify(cfg, null, 2);

        // Final sanity check
        try { JSON.parse(content); } catch (e) {
            AS.ARC.util.showMsgWindow({}, { error_code: 500, error_msg: 'Invalid JSON: ' + e.message }, fn.win);
            return;
        }

        fn.win.el.mask(_S('COMMON', 'APPLYING'));
        AS.ARC.ajax({
            url:    AS.ARC.util.getApiUrlWithSid(fn.apiUrl, { act: 'set', tab: 'docker' }),
            method: 'post',
            params: { content: content },
            success: function () {
                fn.win.el.unmask();
                AS.ARC.ajax({
                    url:    AS.ARC.util.getApiUrlWithSid(fn.apiUrl, { act: 'restart' }),
                    method: 'post',
                    success: function () { fn.switchTab('docker'); },
                    failure: function () { fn.switchTab('docker'); }
                });
            },
            failure: function (json) {
                fn.win.el.unmask();
                AS.ARC.util.showMsgWindow({ 5000: _S('COMMON', 'SESSION_TIMEOUT') }, json, fn.win);
            }
        });
    },

    /* ── Hosts tab ──────────────────────────────────────────────────────── */
    renderHostsTab: function (cardPanel, json) {
        var fn   = this,
            rows = [];

        if (json.content) {
            Ext.each(json.content.split('\n'), function (line) {
                line = Ext.String.trim(line);
                if (!line || line.charAt(0) === '#') { return; }
                var parts = line.split(/[ \t]+/);
                if (parts.length >= 2) {
                    rows.push({ ip: parts[0], host: parts.slice(1).join(' ') });
                }
            });
        }

        var store = Ext.create('Ext.data.Store', {
            fields: ['ip', 'host'],
            data:   rows
        });

        var grid = Ext.create('Ext.grid.Panel', {
            itemId:   'hostsGrid',
            store:    store,
            border:   false,
            anchor:   '100%',
            height:   200,
            columns: [{
                text:      _S('PERSISTENCE', 'COL_IP'),
                dataIndex: 'ip',
                flex:      1
            }, {
                text:      _S('PERSISTENCE', 'COL_HOST'),
                dataIndex: 'host',
                flex:      2
            }],
            dockedItems: [{
                xtype: 'toolbar',
                dock:  'top',
                items: [{
                    text:    _S('PERSISTENCE', 'BTN_ADD'),
                    handler: function () { fn.showHostPopup('add', null, store); }
                }, {
                    text:     _S('PERSISTENCE', 'BTN_MODIFY'),
                    itemId:   'hostsModifyBtn',
                    disabled: true,
                    handler: function () {
                        var sel = grid.getSelectionModel().getSelection();
                        if (sel.length) { fn.showHostPopup('modify', sel[0], store); }
                    }
                }, {
                    text:     _S('PERSISTENCE', 'BTN_DELETE'),
                    itemId:   'hostsDeleteBtn',
                    disabled: true,
                    handler: function () {
                        var sel = grid.getSelectionModel().getSelection();
                        if (sel.length) { store.remove(sel); }
                    }
                }]
            }],
            listeners: {
                selectionchange: function (model, sel) {
                    var has = sel.length > 0;
                    grid.down('#hostsModifyBtn').setDisabled(!has);
                    grid.down('#hostsDeleteBtn').setDisabled(!has);
                }
            }
        });

        cardPanel.add(Ext.create('Ext.panel.Panel', {
            cls:    'as-page-panel app-cappysan-persistence',
            border: false,
            layout:     'anchor',
            autoScroll: true,
            defaults: { anchor: '100%' },
            items: [{
                xtype:    'fieldset',
                title:    'Hosts',
                defaults: { anchor: '100%' },
                items:    [grid]
            }, {
                xtype:    'fieldset',
                title:    _S('PERSISTENCE', 'SECTION_RESULT'),
                defaults: { anchor: '100%' },
                items: [{
                    xtype: 'displayfield',
                    value: 'Contents of /etc/hosts:'
                }, {
                    xtype:      'textarea',
                    anchor:     '100%',
                    height:     140,
                    readOnly:   true,
                    cls:        'persistence-conf-view',
                    value:      json.system_content || ''
                }]
            }],
            dockedItems: [{
                xtype: 'toolbar',
                dock:  'bottom',
                ui:    'footer',
                items: [
                    { xtype: 'component', flex: 1 },
                    {
                        xtype:   'button',
                        text:    _S('COMMON', 'APPLY'),
                        handler: function () { fn.saveHostsTab(); }
                    }
                ]
            }]
        }));
    },

    showHostPopup: function (mode, record, store) {
        var fn       = this,
            isModify = (mode === 'modify');

        fn.hostPopup = Ext.create('AS.ARC.msgWindow', {
            parentWin: fn.win,
            title:     isModify ? _S('PERSISTENCE', 'POPUP_TITLE_MODIFY') : _S('PERSISTENCE', 'POPUP_TITLE_ADD'),
            width:     480,
            height:    200,
            iconType:  'info',
            asItems: [{
                xtype:      'textfield',
                fieldLabel: AS.ARC.util.fontToBold(_S('PERSISTENCE', 'LABEL_IP_ADDRESS')),
                itemId:     'popupIp',
                labelWidth: 70,
                width:      340,
                value:      isModify ? record.get('ip') : ''
            }, {
                xtype:      'textfield',
                fieldLabel: AS.ARC.util.fontToBold(_S('PERSISTENCE', 'COL_HOST')),
                itemId:     'popupHost',
                labelWidth: 70,
                width:      340,
                value:      isModify ? record.get('host') : ''
            }],
            fbar: [{
                text:    _S('COMMON', 'OK'),
                handler: function () {
                    var ipFld = fn.hostPopup.down('#popupIp'),
                        hFld  = fn.hostPopup.down('#popupHost');

                    if (!ipFld || !hFld) { return; }

                    var ip   = Ext.String.trim(ipFld.getValue()),
                        host = Ext.String.trim(hFld.getValue());

                    // IPv4: dotted decimal, IPv6: colon-hex (full, compressed, mapped)
                    var ipv4Re = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                    var ipv6Re = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

                    if (!ip) {
                        ipFld.markInvalid(_S('PERSISTENCE', 'ERR_INVALID_IP'));
                        return;
                    }
                    if (!ipv4Re.test(ip) && !ipv6Re.test(ip)) {
                        ipFld.markInvalid(_S('PERSISTENCE', 'ERR_INVALID_IP'));
                        return;
                    }
                    if (!host) {
                        hFld.markInvalid(_S('COMMON', 'REQUIRED'));
                        return;
                    if (ip.indexOf("'") !== -1 || ip.indexOf('"') !== -1) {
                        ipFld.markInvalid(_S('PERSISTENCE', 'ERR_NO_QUOTES'));
                        return;
                    }
                    if (host.indexOf("'") !== -1 || host.indexOf('"') !== -1) {
                        hFld.markInvalid(_S('PERSISTENCE', 'ERR_NO_QUOTES'));
                        return;
                    }
                    }

                    if (isModify) {
                        record.set('ip',   ip);
                        record.set('host', host);
                    } else {
                        store.add({ ip: ip, host: host });
                    }
                    fn.hostPopup.close();
                }
            }, {
                text:    _S('COMMON', 'CANCEL'),
                handler: function () { fn.hostPopup.close(); }
            }]
        });

        fn.hostPopup.show();
    },

    saveHostsTab: function () {
        var fn    = this,
            grid  = fn.win.down('#hostsGrid'),
            lines = [];

        grid.getStore().each(function (rec) {
            var ip   = Ext.String.trim(rec.get('ip')),
                host = Ext.String.trim(rec.get('host'));
            if (ip && host) { lines.push(ip + '\t' + host); }
        });

        fn.win.el.mask(_S('COMMON', 'APPLYING'));
        AS.ARC.ajax({
            url:    AS.ARC.util.getApiUrlWithSid(fn.apiUrl, { act: 'set', tab: 'hosts' }),
            method: 'post',
            params: { content: lines.join('\n') },
            success: function () {
                fn.win.el.unmask();
                AS.ARC.ajax({
                    url:    AS.ARC.util.getApiUrlWithSid(fn.apiUrl, { act: 'restart' }),
                    method: 'post',
                    success: function () { fn.switchTab('hosts'); },
                    failure: function () { fn.switchTab('hosts'); }
                });
            },
            failure: function (json) {
                fn.win.el.unmask();
                AS.ARC.util.showMsgWindow({ 5000: _S('COMMON', 'SESSION_TIMEOUT') }, json, fn.win);
            }
        });
    },

    /* ── Layout ─────────────────────────────────────────────────────────── */
    getMainPanel: function () {
        var fn = this;

        return Ext.create('Ext.panel.Panel', {
            itemId: 'main',
            border: false,
            layout: 'border',
            items: [{
                region: 'west',
                itemId: 'westPanel',
                cls:    'as-selector-panel',
                border: false,
                width:  150,
                layout: 'fit',
                items:  [fn.getNavGrid()]
            }, {
                region: 'center',
                xtype:  'panel',
                itemId: 'cardPanel',
                border: false,
                layout: 'fit'
            }]
        });
    }
});

Ext.define('AS.ARC.apps.persistence.main', {
    extend:     'AS.ARC._appBase',
    appTag:     'cappysan-persistence',
    title:      'Persistence',
    appMaxNum:  1,
    appOpenNum: 0,
    appIsReady: true,
    appWins:    [],

    createWindow: function () {
        var desktop = this.core.getDesktop(),
            app     = this;

        if ((this.appOpenNum === this.appMaxNum) || !this.appIsReady) {
            this.appWins[0].show();
            return;
        }

        this.appIsReady = false;

        var persistence = Ext.create('AS.ARC.apps.persistence.core', {
            app:     this,
            desktop: desktop,
            id:      this.id + '-' + Ext.id()
        });

        persistence.win.on('render', function () {
            app.appOpenNum++;
            app.appIsReady = true;
        });

        persistence.win.on('beforeclose', function () {
            app.appOpenNum--;
            app.appIsReady = true;
            app.appWins.pop();
        });

        persistence.win.show();
        this.appWins.push(persistence.win);
        return persistence.win;
    }
});
