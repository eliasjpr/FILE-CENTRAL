/**
 * Created by eperez on 2/7/15.
 */
module.exports = {
  blast: function (progress, sessionUUID, startTime) {
    var endTime = (new Date()).getTime(),
        duration = Math.round((endTime - startTime) / 1000),
        speedBps = Math.round(progress.written / duration),
        speedKbps = (speedBps / 1024).toFixed(2),
        speedMbps = (speedKbps / 1024).toFixed(2),
        percent = Math.floor((progress.written / progress.stream.byteCount) * 100);


    // Emiting messages to specific session sessionUUID
    sails.sockets.blast(sessionUUID, {
      percent      : percent,
      duration     : duration,
      speedKbps    : speedKbps,
      speedMbps    : speedMbps,
      totalSize    : progress.stream.byteCount,
      totalUploaded: progress.written,
      fileName     : progress.name
    });
  }
};
;
;
