(function() {
    'use strict';

    $('head').append('<script type="text/javascript" src="https://jalibu.github.io/LSHeat/LSHeat/leaflet-heat.js"></script>');

    var LS_HEATMAP_STORAGE = "LS_HEATMAP_STORAGE";

    var carIds = {
        0: 'LF 20',
        1: 'LF 10',
        2: 'DLK 23',
        3: 'ELW 1',
        4: 'RW',
        5: 'GW-A',
        6: 'LF 8/6',
        7: 'LF 20/16',
        8: 'LF 10/6',
        9: 'LF 16-TS',
        10: 'GW-Öl',
        11: 'GW-L2-Wasser',
        12: 'GW-Messtechnik',
        13: 'SW 1000',
        14: 'SW 2000',
        15: 'SW 2000-Tr',
        16: 'SW KatS',
        17: 'TLF 2000',
        18: 'TLF 3000',
        19: 'TLF 8/8',
        20: 'TLF 8/18',
        21: 'TLF 16/24-Tr',
        22: 'TLF 16/25',
        23: 'TLF 16/45',
        24: 'TLF 20/40',
        25: 'TLF 20/40-SL',
        26: 'TLF 16',
        27: 'GW-Gefahrgut',
        28: 'RTW',
        29: 'NEF',
        30: 'HLF 20',
        31: 'RTH',
        32: 'FuStW',
        33: 'GW-Höhenrettung',
        34: 'ELW 2',
        35: 'leBefKw',
        36: 'MTW',
        37: 'TSF-W',
        38: 'KTW',
        39: 'GKW',
        40: 'MTW-TZ',
        41: 'MzKW',
        42: 'LKW K9',
        43: 'BRmG R',
        44: 'Anh. DLE',
        45: 'MLW 5',
        46: 'WLF',
        47: 'AB-Rüst',
        48: 'AB-Atemschutz',
        49: 'AB-Öl',
        50: 'GruKw',
        51: 'FüKw',
        52: 'GefKw',
        53: 'GW Dekon-P',
        54: 'AB-Dekon-P',
        55: 'KdoW-LNA',
        56: 'KdoW-OrgL',
        57: 'Kran',
        58: 'KTW Typ B',
        59: 'ELW 1 (SEG)',
        60: 'GW-SAN',
        61: 'Polizeihubschrauber',
        62: 'AB-Schlauch',
        63: 'GW-Taucher',
        64: 'GW-Wasserrettung',
        65: 'LKW 7 Lkr 19 tm',
        66: 'Anh MzB',
        67: 'Anh SchlB',
        68: 'Anh MzAB',
        69: 'Tauchkraftwagen',
        70: 'MZB',
        71: 'AB-MZB'
    };

    function getSettings(){
        var settings = {
            'heatmap-activated': {'name': 'Aktiviert', 'type': 'boolean', 'default': false},
            'heatmap-radius': {'name': 'Radius', 'type': 'range', 'default': '80'},
            'heatmap-intensity': {'name': 'IntensitÃ¤t', 'type': 'range', 'default': '15'},
            'heatmap-vehicle': {'name': 'Fahrzeug-Typ', 'type': 'select', 'default': '0', 'values' : carIds}
        };

        if (!window.localStorage.getItem(LS_HEATMAP_STORAGE)) {
            for (var key in settings) {
                settings[key].value = settings[key].default;
            }
        } else {
            settings = JSON.parse(window.localStorage.getItem(LS_HEATMAP_STORAGE));
        }
        return settings;
    }

    function getSetting(name){
        var settings = getSettings();
        return settings[name].value;
    }

    function setSettings(reload){
        var settings = getSettings();
        for (var key in settings) {
            var formElement = $('#' + key);
            if(settings[key].type == 'boolean'){
                if (formElement.is(':checked')) {
                    settings[key].value = true;
                } else {
                    settings[key].value = false;
                }
            } else{
                settings[key].value = parseInt(formElement.val());
            }
        }

        window.localStorage.removeItem(LS_HEATMAP_STORAGE);
        window.localStorage.setItem(LS_HEATMAP_STORAGE, JSON.stringify(settings));

        if(reload) parent.location.reload();
    }

    $( window ).load(function() {
        if (window.top != window.self){
            // Nothing to do here yet.
        } else {
            handleMainWindow();
        }
    });

    function handleMainWindow(){
        renderMap();
        renderMapSettings();
    }

    function renderMapSettings(){
        var btn_text;
        if(getSetting('heatmap-activated')){
            btn_text = carIds[getSetting('heatmap-vehicle')];
        } else {
            btn_text = "Aktivieren";
        }
        $('.leaflet-control-container .leaflet-bottom.leaflet-left').append('<div id="ls-heatmap-config-wrapper" class="leaflet-bar leaflet-control" style="background-color: white;"><img id="ls-heatmap-config-img" style="height: 22px; width: 22px" src="https://jalibu.github.io/LSHeat/LSHeat/ls-heat-layer.png"></div>');
        $('#ls-heatmap-config-img').on('click', function(){
            var wrapper = $('#ls-heatmap-config-wrapper');
            var isOpened = $(wrapper).attr('data-opened') == 'true';
            if(isOpened){
                $('#ls-heatmap-config').remove();
                $(wrapper).attr('data-opened', 'false');
            } else {
                var mapConfig = '<div id="ls-heatmap-config"><table style="margin-left: 30px; margin-bottom: 10px; margin-right: 10px;" class="ls-form-group"></table>';
                $('#ls-heatmap-config-wrapper').append(mapConfig);
                $(wrapper).attr('data-opened', 'true');

                // Aktiviert
                $('#ls-heatmap-config .ls-form-group').append('<tr class="ls-heatmap-option"><td>Aktiviert</td><td><input type="checkbox" id="heatmap-activated"></td></tr>');
                if(getSetting('heatmap-activated')){
                    $('#heatmap-activated').attr('checked', 'checked');
                }

                // Radius
                $('#ls-heatmap-config .ls-form-group').append('<tr class="ls-heatmap-option"><td>Radius</td><td><input type="text" value="' + getSetting('heatmap-radius') + '" id="heatmap-radius"></td></tr>');

                // Intensity
                $('#ls-heatmap-config .ls-form-group').append('<tr class="ls-heatmap-option"><td>IntensitÃ¤t</td><td><input type="text" value="' + getSetting('heatmap-intensity') + '" id="heatmap-intensity"></td></tr>');

                // Vehicle
                $('#ls-heatmap-config .ls-form-group').append('<tr class="ls-heatmap-option"><td>Fahrzeug</td><td><select id="heatmap-vehicle"></select></td></tr>');
                for (var key in carIds) {
                    if(getSetting('heatmap-vehicle') == key){
                        $('#heatmap-vehicle').append('<option selected value="'+ key + '">' + carIds[key] + '</option>');
                    } else {
                        $('#heatmap-vehicle').append('<option value="'+ key + '">' + carIds[key] + '</option>');
                    }
                }

                // Buttons
                $('#ls-heatmap-config .ls-form-group').append('<tr class="ls-heatmap-option"><td><button id="heatmap_save" class="btn btn-success">Speichern</button></td><td><button id="heatmap_close" class="btn">SchlieÃen</button></td></tr>');

                $('#heatmap_save').click(function () {
                    setSettings();
                    renderMap();
                    $('#ls-heatmap-config-img').click();
                });

                $('#heatmap_close').click(function () {

                    $('#ls-heatmap-config-img').click();
                });
            }

        });
    }
    var heat;
    function renderMap(){
        if(getSetting('heatmap-activated')){
            var vehicles = [];
            $('#building_list .building_list_li').each(function(){
                var building = $(this);
                var long = $(building).find('.map_position_mover').attr('data-longitude');
                var lat = $(building).find('.map_position_mover').attr('data-latitude');
                $(this).find('.building_list_vehicle_element').each(function(){
                    var vehicle_type_id = $(this).find('.vehicle_building_list_button').attr('vehicle_type_id');
                    var name = $(this).find('.vehicle_building_list_button').text();
                    var vehicle = {'vehicle_type_id': vehicle_type_id, 'lat': lat, 'long': long, 'name': name};
                    vehicles.push(vehicle);
                });
            });

            var entries = [];
            $(vehicles).each(function(){
                var vehicle = this;
                if(vehicle.vehicle_type_id == getSetting('heatmap-vehicle')){
                    entries.push([vehicle.lat, vehicle.long, getSetting('heatmap-intensity')]);
                }
            });
            if (heat !== undefined) map.removeLayer(heat);
            heat = L.heatLayer(entries, {radius: getSetting('heatmap-radius')}).addTo(map);
        }
    }
})();