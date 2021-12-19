var ERROR = 'ERROR';
var currentPropertyId = 'currentPropertyId';
var db = window.openDatabase('FGW', '1.0', 'FGW', 20000);

if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    $(document).on('ready', onDeviceReady);
}

$(window).on('orientationchange', onOrientationChange);

// Page CREATE
$(document).on('pagebeforeshow', '#page-create-property', function () {
    prepareForm('#page-create-property #frm-register-property');
});

$(document).on('submit', '#page-create-property #frm-register-property', confirmProperty);
$(document).on('submit', '#page-create-property #frm-confirm-property', registerProperty);
$(document).on('vclick', '#page-create-property #frm-confirm-property #edit-property', function () {
    $('#page-create-property #frm-confirm-property').popup('close');
});

$(document).on('change', '#page-create-property #frm-register-property #city_property', function () {
    addAddressOption_District($('#page-create-property #frm-register-property #district_property'), this.value);
    addAddressOption_Ward($('#page-create-property #frm-register-property #ward_property'), -1);
});

$(document).on('change', '#page-create-property #frm-register-property #district_property', function () {
    addAddressOption_Ward($('#page-create-property #frm-register-property #ward_property'), this.value);
});

// Page LIST
$(document).on('pagebeforeshow', '#page-list-property', showListProperty);

$(document).on('submit', '#page-list-property #frm-search-property', searchProperty);

$(document).on('keyup', $('#page-list-property #txt-filter-property'), filterProperty);

$(document).on('change', '#page-list-property #frm-search-property #city_property', function () {
    addAddressOption_District($('#page-list-property #frm-search-property #district_property'), this.value);
    addAddressOption_Ward($('#page-list-property #frm-search-property #ward_property'), -1);
});

$(document).on('change', '#page-list-property #frm-search-property #district_property', function () {
    addAddressOption_Ward($('#page-list-property #frm-search-property #ward_property'), this.value);
});

$(document).on('vclick', '#page-list-property #btn-reset', showListProperty);
$(document).on('vclick', '#page-list-property #btn-filter-popup', openFormSearch);
$(document).on('vclick', '#page-list-property #list-property li a', navigatePageDetail);

// Page DETAIL
$(document).on('pagebeforeshow', '#page-detail', showDetail);

$(document).on('vclick', '#page-detail #btn-update-popup', showUpdate);
$(document).on('vclick', '#page-detail #btn-delete-popup', function () {
    changePopup($('#page-detail #option'), $('#page-detail #frm-delete-property'));
});

$(document).on('vclick', '#page-detail #frm-update-property #cancel', function () {
    $('#page-detail #frm-update-property').popup('close');
});

$(document).on('submit', '#page-detail #frm-note', addNote);
$(document).on('submit', '#page-detail #frm-update-property', updateProperty);
$(document).on('submit', '#page-detail #frm-delete-property', deleteProperty);
$(document).on('keyup', '#page-detail #frm-delete-property #txt-confirm', confirmDeleteProperty);

$(document).on('change', '#page-detail #frm-update-property #city_property', function () {
    addAddressOption_District($('#page-detail #frm-update-property #district_property'), this.value);
    addAddressOption_Ward($('#page-detail #frm-update-property #ward_property'), -1);
});

$(document).on('change', '#page-detail #frm-update-property #district_property', function () {
    addAddressOption_Ward($('#page-detail #frm-update-property #ward_property'), this.value);
});

function onDeviceReady() {
    log(`Device is ready.`);

    prepareDatabase(db);
}

function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        log('Portrait.');
    }
    else {
        log('Landscape.');
    }
}

function changePopup(sourcePopup, destinationPopup) {
    var afterClose = function () {
        destinationPopup.popup("open");
        sourcePopup.off("popupafterclose", afterClose);
    };

    sourcePopup.on("popupafterclose", afterClose);
    sourcePopup.popup("close");
}

function prepareForm(form) {
    addAddressOption($(`${form} #city_property`), 'City');
    addAddressOption_District($(`${form} #district_property`), -1);
    addAddressOption_Ward($(`${form} #ward_property`), -1);

    addOption($(`${form} #furniture_property`), Furniture, 'Furniture');
    addOption($(`${form} #type_property`), Type, 'Type');
}

function addAddressOption_District(select, selectedId, selectedValue = -1) {
    addAddressOption(select, 'District', selectedValue, `WHERE CityId = ${selectedId}`);
}

function addAddressOption_Ward(select, selectedId, selectedValue = -1) {
    addAddressOption(select, 'Ward', selectedValue, `WHERE DistrictId = ${selectedId}`);
}

function addAddressOption(select, name, selectedValue = -1, condition = '') {
    db.transaction(function (tx) {
        var query = `SELECT * FROM ${name} ${condition} ORDER BY Name`;
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of ${name} successfully.`);

            var optionList = `<option value="-1">Select ${name}</option>`;

            for (let item of result.rows) {
                optionList += `<option value="${item.Id}" ${item.Id == selectedValue ? 'selected' : ''}>${item.Name}</option>`;
            }

            select.html(optionList);
            select.selectmenu('refresh', true);
        }
    });
}

function addOption(select, list, name, selectedValue = -1) {
    var optionList = `<option value="-1">Select ${name}</option>`;

    for (var key in list) {
        optionList += `<option value="${list[key]}" ${list[key] == selectedValue ? 'selected' : ''}>${key}</option>`;
    }

    select.html(optionList);
    select.selectmenu('refresh', true);
}

function getFormInfoByValue(form, isNote) {
    var note = isNote ? $(`${form} #note_property`).val() : '';

    var info = {
        'Name': $(`${form} #name_property`).val(),
        'Street': $(`${form} #street_property`).val(),
        'City': $(`${form} #city_property`).val(),
        'District': $(`${form} #district_property`).val(),
        'Ward': $(`${form} #ward_property`).val(),
        'Type': $(`${form} #type_property`).val(),
        'Bedroom': $(`${form} #bedroom_property`).val(),
        'Price': $(`${form} #price_property`).val(),
        'Furniture': $(`${form} #furniture_property`).val(),
        'Reporter': $(`${form} #reporter_property`).val(),
        'Note': note
    };

    return info;
}

function getFormInfoByName(form, isNote) {
    var note = isNote ? $(`${form} #note_property`).val() : '';

    var info = {
        'Name': $(`${form} #name_property`).val(),
        'Street': $(`${form} #street_property`).val(),
        'City': $(`${form} #city_property option:selected`).text(),
        'District': $(`${form} #district_property option:selected`).text(),
        'Ward': $(`${form} #ward_property option:selected`).text(),
        'Type': $(`${form} #type_property option:selected`).text(),
        'Bedroom': $(`${form} #bedroom_property`).val(),
        'Price': $(`${form} #price_property`).val(),
        'Furniture': $(`${form} #furniture_property option:selected`).text(),
        'Reporter': $(`${form} #reporter_property`).val(),
        'Note': note
    };

    return info;
}

function setFormInfo(form, info, isNote) {
    $(`${form} #name_property`).val(info.Name);
    $(`${form} #street_property`).val(info.Street);
    $(`${form} #city_property`).val(info.City);
    $(`${form} #district_property`).val(info.District);
    $(`${form} #ward_property`).val(info.Ward);
    $(`${form} #type_property`).val(info.Type);
    $(`${form} #bedroom_property`).val(info.Bedroom);
    $(`${form} #price_property`).val(info.Price);
    $(`${form} #furniture_property`).val(info.Furniture);
    $(`${form} #reporter_property`).val(info.Reporter);

    if (isNote)
        $(`${form} #note_property`).val(info.Note);
}

function setHTMLInfo(form, info, isNote, isDate = false) {
    var Image = localStorage.getItem('image');
    $(`${form} #name_property`).text(info.Name);
    $(`${form} #street_property`).text(info.Street);
    $(`${form} #city_property`).text(info.City);
    $(`${form} #district_property`).text(info.District);
    $(`${form} #ward_property`).text(info.Ward);
    $(`${form} #type_property`).text(info.Type);
    $(`${form} #bedroom_property`).text(info.Bedroom);
    $(`${form} #price_property`).text(`${info.Price.toLocaleString('en-US')} VNĐ / month`);
    $(`${form} #furniture_property`).text(info.Furniture);
    $(`${form} #reporter_property`).text(info.Reporter);
    $(`${form} #image`).attr("src", "data:image/jpeg;base64," + Image);

    if (isNote)
        $(`${form} #note_property`).text(info.Note);

    if (isDate)
        $(`${form} #date`).text(info.DateAdded);
}

function isValid(form) {
    var isValid = true;
    var error = $(`${form} #error`);

    error.empty();

    if ($(`${form} #city_property`).val() == -1) {
        isValid = false;
        error.append('<p>* City is required.</p>');
    }

    if ($(`${form} #district_property`).val() == -1) {
        isValid = false;
        error.append('<p>* District is required.</p>');
    }

    if ($(`${form} #ward_property`).val() == -1) {
        isValid = false;
        error.append('<p>* Ward is required.</p>');
    }

    if ($(`${form} #type_property`).val() == -1) {
        isValid = false;
        error.append('<p>* Type is required.</p>');
    }

    return isValid;
}

function confirmProperty(e) {
    e.preventDefault();

    if (isValid('#page-create-property #frm-register-property')) {
        var info = getFormInfoByName('#page-create-property #frm-register-property', true);

        db.transaction(function (tx) {
            var query = 'SELECT * FROM Property WHERE Name = ?';
            tx.executeSql(query, [info.Name], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                if (result.rows[0] == null) {
                    log('Open the confirmation popup.');

                    $('#page-create-property #error').empty();

                    setHTMLInfo('#page-create-property #frm-confirm-property', info, true);

                    $('#page-create-property #frm-confirm-property').popup('open');
                }
                else {
                    var error = 'Name exists.';
                    $('#page-create-property #error').empty().append(error);
                    log(error, ERROR);
                }
            }
        });
    }
}

function registerProperty(e) {
    e.preventDefault();

    var info = getFormInfoByValue('#page-create-property #frm-register-property', true);
    var Image = localStorage.getItem('image');
    db.transaction(function (tx) {
        var query = `INSERT INTO Property (Name, Street, City, District, Ward, Type, Bedroom, Price, Furniture, Reporter, Image,  DateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, julianday('now'))`;
        tx.executeSql(query, [info.Name, info.Street, info.City, info.District, info.Ward, info.Type, info.Bedroom, info.Price, info.Furniture, info.Reporter, Image], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Create a property '${info.Name}' successfully.`);

            $('#page-create-property #frm-register-property').trigger('reset');
            $('#page-create-property #error').empty();
            $('#page-create-property #frm-register-property #name_property').focus();

            $('#page-create-property #frm-confirm-property').popup('close');
            $("#page-create-property #image").removeAttr("src", "data:image/jpeg;base64," + Image);

            if (info.Note != '') {
                db.transaction(function (tx) {
                    var query = `INSERT INTO Note (Message, PropertyId, DateAdded) VALUES (?, ?, julianday('now'))`;
                    tx.executeSql(query, [info.Note, result.insertId], transactionSuccess, transactionError);

                    function transactionSuccess(tx, result) {
                        log(`Add new note to property '${info.Name}' successfully.`);
                    }
                });
            }
        }
    });
}

function showListProperty() {
    db.transaction(function (tx) {
        var query = `SELECT Property.Id AS Id, Property.Name AS Name, Price, Bedroom, Type, City.Name AS City, Image
                     FROM Property LEFT JOIN City ON Property.City = City.Id`;

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of properties successfully.`);
            displayList(result.rows);
        }
    });
}

function navigatePageDetail(e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem(currentPropertyId, id);

    $.mobile.navigate('#page-detail', { transition: 'none' });
}

function showDetail() {
    var id = localStorage.getItem(currentPropertyId);

    db.transaction(function (tx) {
        var query = `SELECT Property.*, datetime(Property.DateAdded, '+7 hours') AS DateAddedConverted, City.Name AS CityName, District.Name AS DistrictName, Ward.Name AS WardName, Image
                     FROM Property
                     LEFT JOIN City ON City.Id = Property.City
                     LEFT JOIN District ON District.Id = Property.District
                     LEFT JOIN Ward ON Ward.Id = Property.Ward
                     WHERE Property.Id = ?`;

        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] != null) {
                log(`Get details of property '${result.rows[0].name}' successfully.`);

                var info = {
                    'Name': result.rows[0].Name,
                    'Street': result.rows[0].Street,
                    'City': result.rows[0].CityName,
                    'District': result.rows[0].DistrictName,
                    'Ward': result.rows[0].WardName,
                    'Type': Object.keys(Type)[result.rows[0].Type],
                    'Bedroom': result.rows[0].Bedroom,
                    'Price': result.rows[0].Price,
                    'Furniture': Object.keys(Furniture)[result.rows[0].Furniture],
                    'Reporter': result.rows[0].Reporter,
                    'DateAdded': result.rows[0].DateAddedConverted,
                    'Image': result.rows[0].Image,
                };
                var Image = localStorage.setItem('image', result.rows[0].Image);
                setHTMLInfo('#page-detail #detail', info, false, true);

                showNote();
            }
            else {
                var errorMessage = 'Property not found.';

                log(errorMessage, ERROR);

                $('#page-detail #detail #name_property').text(errorMessage);
                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }
        }
    });
}

function confirmDeleteProperty() {
    var text = $('#page-detail #frm-delete-property #txt-confirm').val();

    if (text == 'confirm delete') {
        $('#page-detail #frm-delete-property #btn-delete').removeClass('ui-disabled');
    }
    else {
        $('#page-detail #frm-delete-property #btn-delete').addClass('ui-disabled');
    }
}

function deleteProperty(e) {
    e.preventDefault();

    var id = localStorage.getItem(currentPropertyId);

    db.transaction(function (tx) {
        var query = 'DELETE FROM Note WHERE PropertyId = ?';
        tx.executeSql(query, [id], function (tx, result) {
            log(`Delete notes of property '${id}' successfully.`);
        }, transactionError);

        var query = 'DELETE FROM Property WHERE Id = ?';
        tx.executeSql(query, [id], function (tx, result) {
            log(`Delete property '${id}' successfully.`);

            $('#page-detail #frm-delete-property').trigger('reset');

            $.mobile.navigate('#page-list-property', { transition: 'none' });
        }, transactionError);
    });
}

function addNote(e) {
    e.preventDefault();

    var id = localStorage.getItem(currentPropertyId);
    var message = $('#page-detail #frm-note #message').val();

    db.transaction(function (tx) {
        var query = `INSERT INTO Note (Message, PropertyId, DateAdded) VALUES (?, ?, julianday('now'))`;
        tx.executeSql(query, [message, id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Add new note to property '${id}' successfully.`);

            $('#page-detail #frm-note').trigger('reset');

            showNote();
        }
    });
}

function showNote() {
    var id = localStorage.getItem(currentPropertyId);

    db.transaction(function (tx) {
        var query = `SELECT Id, Message, datetime(DateAdded, '+7 hours') AS DateAdded FROM Note WHERE PropertyId = ?`;
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of notes successfully.`);

            var noteList = '';
            for (let note of result.rows) {
                noteList += `<div class = 'list' style = "align: right;">
                                <a id = "DeleteNote" data-note='{"Id" : ${note.Id}}'class='ui-block-b'><img style="width: 15px;margin-left: 230px;" src="img/delete.jpg" alt="" /></a>
                                <small style="text-align: right; margin-left: 10px;">${note.DateAdded}</small>
                                <h3>${note.Message}</h3>
                            </div>`;
            }

            $('#list-note').empty().append(noteList);

            log(`Show list of notes successfully.`);
        }
    });
}

$(document).on('vclick', '#page-detail #DeleteNote', function (e) {
    e.preventDefault();

    var id = $(this).data('note').Id;
    db.transaction(function (tx) {
        var query = 'DELETE FROM Note WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            alert("Delete comment successfully !!!")
            showDetail();
        }     
    });

});

$(document).on('vclick', '#page-detail #popupUpdateNote', function (e) {
    e.preventDefault();

    var id = $localStorage.getItem(currentPropertyId);
    var message = $('#popupUpdateNote #noteUpdate').val();
    db.transaction(function (tx) {
        var query = 'UPDATE Note set Message = ? WHERE Id = ?';
        tx.executeSql(query, [message,id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            alert("UPDATE comment successfully !!!")
            showDetail();
        }     
    });

});

function showUpdate() {
    var id = localStorage.getItem(currentPropertyId);

    db.transaction(function (tx) {
        var query = `SELECT * FROM Property WHERE Id = ?`;

        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] != null) {
                log(`Get details of property '${result.rows[0].Name}' successfully.`);

                $(`#page-detail #frm-update-property #name_property`).val(result.rows[0].Name);
                $(`#page-detail #frm-update-property #street_property`).val(result.rows[0].Street);
                $(`#page-detail #frm-update-property #price_property`).val(result.rows[0].Price);
                $(`#page-detail #frm-update-property #bedroom_property`).val(result.rows[0].Bedroom);
                $(`#page-detail #frm-update-property #reporter_property`).val(result.rows[0].Reporter);
                $(`#page-detail #frm-update-property #image`).attr("src", "data:image/jpeg;base64," + result.rows[0].Image);

                addAddressOption($('#page-detail #frm-update-property #city_property'), 'City', result.rows[0].City);
                addAddressOption_District($('#page-detail #frm-update-property #district_property'), result.rows[0].City, result.rows[0].District);
                addAddressOption_Ward($('#page-detail #frm-update-property #ward_property'), result.rows[0].District, result.rows[0].Ward);

                addOption($('#page-detail #frm-update-property #type_property'), Type, 'Type', result.rows[0].Type);
                addOption($('#page-detail #frm-update-property #furniture_property'), Furniture, 'Furniture', result.rows[0].Furniture);

                changePopup($('#page-detail #option'), $('#page-detail #frm-update-property'));
            }
        }
    });
}
$(document).on('vclick', '#btntakepictureedit', takepictureedit);
function takepictureedit() {

    let cameraOptions = {
        destinationType: Camera.DestinationType.DATA_URL,
        saveToPhotoAlbum: true,
    }

    navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);


    function cameraSuccess(imageData) {
        var id = localStorage.getItem(currentPropertyId);
        db.transaction(function (tx) {
            var query = `UPDATE Property
                        SET Image = ?
                        WHERE Id = ?`;

            tx.executeSql(query, [imageData, id], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                showUpdate()
            }
        });     
    }

    function cameraError(error) {
        alert(error)
    }
}
function updateProperty(e) {
    e.preventDefault();
    var Image = localStorage.getItem('image');
    if (isValid('#page-detail #frm-update-property')) {
        var id = localStorage.getItem(currentPropertyId);
        var info = getFormInfoByValue('#page-detail #frm-update-property', false);

        db.transaction(function (tx) {
            var query = `UPDATE Property
                        SET Name = ?,
                            Street = ?, City = ?, District = ?, Ward = ?,
                            Type = ?, Bedroom = ?, Price = ?, Furniture = ?, Reporter = ?,
                            DateAdded = julianday('now')
                        WHERE Id = ?`;

            tx.executeSql(query, [info.Name, info.Street, info.City, info.District, info.Ward, info.Type, info.Bedroom, info.Price, info.Furniture, info.Reporter, id], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                log(`Update property '${info.Name}' successfully.`);

                showDetail();

                $('#page-detail #frm-update-property').popup('close');
            }
        });
    }
}

function filterProperty() {
    var filter = $('#page-list-property #txt-filter-property').val().toLowerCase();
    var li = $('#page-list-property #list-property ul li');

    for (var i = 0; i < li.length; i++) {
        var a = li[i].getElementsByTagName("a")[0];
        var text = a.textContent || a.innerText;

        li[i].style.display = text.toLowerCase().indexOf(filter) > -1 ? "" : "none";
    }
}

function openFormSearch(e) {
    e.preventDefault();
    prepareForm('#page-list-property #frm-search-property');
    $('#page-list-property #frm-search-property').popup('open');
}

function searchProperty(e) {
    e.preventDefault();

    var name = $('#page-list-property #frm-search-property #name_property').val();
    var street = $('#page-list-property #frm-search-property #street_property').val();
    var city = $('#page-list-property #frm-search-property #city_property').val();
    var district = $('#page-list-property #frm-search-property #district_property').val();
    var ward = $('#page-list-property #frm-search-property #ward_property').val();
    var type = $('#page-list-property #frm-search-property #type_property').val();
    var bedroom = $('#page-list-property #frm-search-property #bedroom_property').val();
    var furniture = $('#page-list-property #frm-search-property #furniture_property').val();

    db.transaction(function (tx) {
        var query = `SELECT Property.Id AS Id, Property.Name AS Name, Price, Bedroom, Type, Image, City.Name AS City
                     FROM Property LEFT JOIN City ON Property.City = City.Id
                     WHERE`;

        query += name ? ` Property.Name LIKE "%${name}%"   AND` : '';
        query += street ? ` Street LIKE "%${street}%"   AND` : '';
        query += city != -1 ? ` City = ${city}   AND` : '';
        query += district != -1 ? ` District = ${district}   AND` : '';
        query += ward != -1 ? ` Ward = ${ward}   AND` : '';
        query += type != -1 ? ` Type = ${type}   AND` : '';
        query += bedroom ? ` Bedroom = ${bedroom}   AND` : '';
        query += furniture != -1 ? ` Furniture = ${furniture}   AND` : '';

        query = query.substring(0, query.length - 6);

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Search properties successfully.`);

            displayList(result.rows);

            $('#page-list-property #frm-search-property').trigger('reset');
            $('#page-list-property #frm-search-property').popup('close');
        }
    });
}

function displayList(list) {
    var propertyList = `<ul id='list-property' data-role='listview' class='ui-nodisc-icon ui-alt-icon'>`;

    propertyList += list.length == 0 ? '<li><h2>There is no property.</h2></li>' : '';

    for (let property of list) {
        propertyList +=
            `<li class="ui-btn ui-btn-icon-right ui-icon-carat-r" style="color: #333;">
                <a data-details='{"Id" : ${property.Id}}'>
                    <h2 style='margin-bottom: 0px;color: #333;'>${property.Name}</h2>
                    <p style='margin-top: 2px; margin-bottom: 10px;color: #333;'><small>${property.City}</small></p>
                    <p><img src="data:image/png;base64,${property.Image}"width="100" /></p>
                    <div>
                        <img src='img/bedroom.png' height='20px' style='margin-bottom: -5px;'>
                        <strong style='font-size: 13px;color: #333;'>${property.Bedroom}<strong>
                
                        &nbsp;&nbsp;
                
                        <img src='img/renthouse.png' height='21px' style='margin-bottom: -5px;'>
                        <strong style='font-size: 13px;color: #333;'>${Object.keys(Type)[property.Type]}<strong>

                        &nbsp;&nbsp;
                
                        <img src='img/icon-price.png' height='20px' style='margin-bottom: -3px;'>
                        <strong style='font-size: 13px;color: #333;'>${property.Price.toLocaleString('en-US')} VNĐ / month<strong>
                    </div>
                </a>
            </li>`;
    }
    propertyList += `</ul>`;

    $('#list-property').empty().append(propertyList).listview('refresh').trigger('create');

    log(`Show list of properties successfully.`);
}

// bell
$(document).on('vclick', '#btn-beep', Beep);
function Beep() {
    navigator.notification.beep(5);
}
// vib
$(document).on('vclick', '#btn-vibration', Vibration);
function Vibration() {
    navigator.vibrate(1000, 1000, 1000, 3000, 1000, 1000, 1000, 3000, 1000);
}
//pic
$(document).on('vclick', '#btntakepicture', takepicture);
function takepicture() {

    let cameraOptions = {
        destinationType: Camera.DestinationType.DATA_URL,
        saveToPhotoAlbum: true,
    }

    navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);


    function cameraSuccess(imageData) {
     
        $("#page-create-property #image").attr("src", "data:image/jpeg;base64," + imageData);
        localStorage.setItem('image', imageData);
    }

    function cameraError(error) {
        alert(error)
    }

}