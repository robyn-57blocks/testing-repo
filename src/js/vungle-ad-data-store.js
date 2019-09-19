export default {
    write,
    push,
    getAll,
    get
};

window.vungleDataStorage = {}
var data = window.vungleDataStorage

function write(obj) {
    data = JSON.parse(JSON.stringify(obj));
}

function push(name, obj) {
    data[name] = JSON.parse(JSON.stringify(obj));
}

function getAll() {
    return JSON.parse(JSON.stringify(data));
}

function get(item, clone = true) {
    if (typeof data[item] !== 'undefined' && clone)
        return JSON.parse(JSON.stringify(data[item]));
    else if (typeof data[item] !== 'undefined')
        return data[item];
    else
        return null
}