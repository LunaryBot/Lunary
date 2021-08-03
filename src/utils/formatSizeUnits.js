module.exports = (bytes) => {
    if      (bytes >= 1000000000000000000000000) { bytes = (bytes / 1000000000000000000000000).toFixed(2) + " YB"; }
    else if (bytes >= 1000000000000000000000)    { bytes = (bytes / 1000000000000000000000).toFixed(2) + " ZB"; }
    else if (bytes >= 1000000000000000000)       { bytes = (bytes / 1000000000000000000).toFixed(2) + " EB"; }
    else if (bytes >= 1000000000000000)          { bytes = (bytes / 1000000000000000).toFixed(2) + " PB"; }
    else if (bytes >= 1000000000000)             { bytes = (bytes / 1000000000000).toFixed(2) + " TB"; }
    else if (bytes >= 1000000000)                { bytes = (bytes / 1000000000).toFixed(2) + " GB"; }
    else if (bytes >= 1000000)                   { bytes = (bytes / 1000000).toFixed(2) + " MB"; }
    else if (bytes >= 1000)                      { bytes = (bytes / 1000).toFixed(2) + " KB"; }
    else if (bytes > 1)                          { bytes = bytes + " bytes"; }
    else if (bytes == 1)                         { bytes = bytes + " byte"; }
    else                                         { bytes = "0 bytes"; }
    return bytes;
}