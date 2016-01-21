/**
 * Created by nishant on 12/21/2015.
 */

utilityModule.service('utilityService', function () {
    var isExpert = null;
    return ({
        formatDuration: formatDuration,
        getFormattedDate: getFormattedDate,
        getFormattedTime: getFormattedTime,
        isExpert: isExpert,
        setExpertFlag: setExpertFlag,
        getExpertFlag: getExpertFlag
    });

    function setExpertFlag(expertFlag) {
        isExpert = expertFlag;
    }

    function getExpertFlag() {
        return isExpert;
    }

    function getFormattedDate(dateTimeStirng) {
        var monthNames = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct",
            "Nov", "Dec"
        ];

        var dateTime = new Date(dateTimeStirng);
        var day = dateTime.getDate();
        var monthIndex = dateTime.getMonth();
        var year = dateTime.getFullYear();
        return (day + ' ' + monthNames[monthIndex] + ' ' + year);
    }

    function getFormattedTime(dateTimeStirng) {
        var dateTime = new Date(dateTimeStirng);
        var hours = dateTime.getHours();
        var dayTime = 'AM';
        if (hours > 12) {
            hours = hours - 12;
            dayTime = 'PM';
        }
        var minutes = dateTime.getMinutes();
        var minutesDigitCompensation = '';
        if (minutes < 10) {
            minutesDigitCompensation = '0';
        }
        return (hours + ':' + minutesDigitCompensation + minutes + ' ' + dayTime);
    }

    function formatDuration(timeString) {
        var milliSec_num = parseInt(timeString, 10);
        var sec_num = Math.floor(milliSec_num / 1000);
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        var timeFormatted = hours + ':' + minutes + ':' + seconds;
        return timeFormatted;
    }
});