module.exports = function formatSizeUnits(bytes) {
    if      (bytes >= 1000000000000000000000000) { bytes = (bytes / 1000000000000000000000000).toFixed(1) + "YB"; }
    else if (bytes >= 1000000000000000000000)    { bytes = (bytes / 1000000000000000000000).toFixed(1) + "ZB"; }
    else if (bytes >= 1000000000000000000)       { bytes = (bytes / 1000000000000000000).toFixed(1) + "EB"; }
    else if (bytes >= 1000000000000000)          { bytes = (bytes / 1000000000000000).toFixed(1) + "PB"; }
    else if (bytes >= 1000000000000)             { bytes = (bytes / 1000000000000).toFixed(1) + "TB"; }
    else if (bytes >= 1000000000)                { bytes = (bytes / 1000000000).toFixed(1) + "GB"; }
    else if (bytes >= 1000000)                   { bytes = (bytes / 1000000).toFixed(1) + "MB"; }
    else if (bytes >= 1000)                      { bytes = (bytes / 1000).toFixed(1) + "KB"; }
    else if (bytes > 1)                          { bytes = bytes + " bytes"; }
    else if (bytes == 1)                         { bytes = bytes + " byte"; }
    else                                         { bytes = "0 bytes"; }
    return bytes;
}