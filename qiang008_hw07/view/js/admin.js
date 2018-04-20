$(document).ready(function() {
    var getUsers = function(cb) {
        $.ajax({
            url: 'admin/users',
            method: 'GET',
            cache: false,
        }).fail(function() {
            cb && cb(data.em || 'get users error: server error', null);
        }).done(function(data) {
            if (data && data.ec === 200) {
                cb && cb(null, data.data || []);
            } else {
                cb && cb(data.em || 'get users error', null);
            }
        })
    }
    var renderUsersTable = function(users) {
        if (users && users.length) {
            var htmlArr= [];
            users.forEach(function(user) {
                var tmp = '';
                tmp += '<tr>';
                tmp += '<td>' + user.id + '</td>';
                tmp += '<td>' + user.name + '</td>';
                tmp += '<td>' + user.login + '</td>';
                tmp += '<td></td>';
                tmp += '<td><span class="glyphicon glyphicon-pencil edit-user" aria-hidden="true"></span> <span class="glyphicon glyphicon-trash delete-user" aria-hidden="true"></span></td>';
                tmp += '</tr>';
                htmlArr.push(tmp);
            });
            console.log(htmlArr);
            var htmlStr = htmlArr.join('');
            $('#usersTable tbody').html(htmlStr);
        }
    }
    var refreshUsersTable = function() {
        getUsers(function(err, users) {
            if (err) {
                alert(err);
                return;
            }
            return renderUsersTable(users);
        });
    }

    $('.btn.add-user').on('click', function(e) {
        console.log(e);
        
        var htmlStr = '<tr>';
        htmlStr += '<td></td>';
        htmlStr += '<td><input type="text" name="name"></td>';
        htmlStr += '<td><input type="text" name="login"></td>';
        htmlStr += '<td><input type="password" name="password"></td>';
        htmlStr += '<td><span class="glyphicon glyphicon-floppy-save add-user-save" aria-hidden="true"></span> <span class="glyphicon glyphicon-remove add-user-cancel" aria-hidden="true"></span></td>';
        htmlStr += '</tr>';
        $('#usersTable tbody').append(htmlStr);
    });
    $('#usersTable').on('click', '.add-user-cancel', function() {
        $(this).parents('tr').remove();
    });
    $('#usersTable').on('click', '.add-user-save', function() {
        var $tr = $(this).parents('tr');
        var name = $tr.find('input[name="name"]').val().trim();
        var login = $tr.find('input[name="login"]').val().trim();
        var password = $tr.find('input[name="password"]').val().trim();
        if (name && login && password) {
            postAddUser({
                'name': name,
                'login': login,
                'password': password,
            }, function(err, res) {
                if (err) {
                    // alert(err);
                    showError(err);
                    return;
                }
                hideError();
                $(this).parents('tr').remove();
                refreshUsersTable();
            });
        }
    });
    $('#usersTable').on('click', '.edit-user', function() {
        var $tr = $(this).parents('tr');
        var id = $tr.children().eq(0).text();
        var name = $tr.children().eq(1).text();
        var login = $tr.children().eq(2).text();
        $(this).parents('tr').hide();
        var htmlStr = '';
        htmlStr += '<tr data-id="' + id +'">';
        htmlStr += '<td></td>';        
        htmlStr += '<td><input type="text" name="name" value="' + name + '"</td>';        
        htmlStr += '<td><input type="text" name="login" value="' + login + '"</td>';        
        htmlStr += '<td><input type="password" name="password"></td>';
        htmlStr += '<td><span class="glyphicon glyphicon-floppy-save     update-user" aria-hidden="true"></span> <span class="glyphicon glyphicon-refresh edit-user-cancel" aria-hidden="true"></span></td>';
        htmlStr += '</tr>';
        $tr.after(htmlStr);
    });
    $('#usersTable').on('click', '.update-user', function() {
        $tr = $(this).parents('tr');
        var id = $tr.data('id');
        var name = $tr.find('input[name="name"]').val().trim();
        var login = $tr.find('input[name="login"]').val().trim();
        var password = $tr.find('input[name="password"]').val().trim();
        updateUser({
            id: id,
            name: name,
            login: login,
            password: password,
        }, function(err, res) {
            if (err) {
                return showError(err);
            }
            refreshUsersTable();
            if (login === res) {
                $('.current-login').text('Welcome ' + res + '!');
            }
        });
    });
    $('#usersTable').on('click', '.edit-user-cancel', function() {
        $(this).parents('tr').hide();
        $(this).parents('tr').prev().show();
        $(this).parents('tr').remove();
        // $(this).parents('tbody').find('tr').show();
    });
    $('#usersTable').on('click', '.delete-user', function() {
        var $tr = $(this).parents('tr');
        var id = $tr.children(':first-child').text();
        deleteUser(id, function(err, res) {
            if (err) {
                showError(err);
                return;
            }
            $tr.remove();
        })
    });

    var postAddUser = function(data, cb) {
        if (!data) {
            cb && cb('no data', null);
        }
        $.ajax({
            url: 'admin/add-user',
            method: 'POST',
            data: data,
        }).fail(function() {
            cb && cb(data.em || 'add user error: server error', null);
        }).done(function(data) {
            if (data && data.ec === 200) {
                cb && cb(null, data.data || []);
            } else {
                cb && cb(data.em || 'add user error', null);
            }
        });
    }

    var deleteUser = function(id, cb) {
        console.log('deleteUser', id);
        $.ajax({
            url: 'admin/delete-user',
            method: 'POST',
            data: {
                id: id,
            },
        }).fail(function() {
            cb && cb(data.em || 'delete user error: server error', null);
        }).done(function(data) {
            if (data && data.ec === 200) {
                cb && cb(null, data.data || true);
            } else {
                cb && cb(data.em || 'delete user error', null);
            }
        });
    }

    var updateUser = function(data, cb) {
        $.ajax({
            url: 'admin/update-user',
            method: 'POST',
            data: data,
        }).fail(function() {
            cb && cb(data.em || 'update user error: server error', null);
        }).done(function(data) {
            if (data && data.ec === 200) {
                cb && cb(null, data.data || true);
            } else {
                cb && cb(data.em || 'update user error', null);
            }
        });
    }

    var showError = function(errMsg) {
        $('.err-box .err-msg').text(errMsg).show();
    }

    var hideError = function() {
        $('.err-box .err-msg').text('').hide();
    }

    refreshUsersTable();
    

});