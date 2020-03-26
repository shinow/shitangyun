import moment from 'moment'
moment.locale('zh-cn')

/**
 * 获取从当前时间开始长度为length日期数组
 * 
 * @param {Object} length
 */
function getDateList(length) {
    // 获取日期列表
    let dateList = []
    let len = length || 7
    for (let i = 0; i < len; i++) {
        const time = new Date(new Date().setDate(new Date().getDate() + i))
        const year = time.getFullYear();
        const month = `0${time.getMonth() + 1}`.slice(-2);
        const strDate = `0${time.getDate()}`.slice(-2);
        dateList.push(`${year}-${month}-${strDate}`)
    }
    return dateList
}

/**
 * 获取日期的字符串，格式为yyyy-MM-dd
 * 
 * @param {Object} d 默认为当前时间
 */
function getDateStr(d) {
    let date = d || new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    if (month < 10) {
        month = "0" + month
    }
    if (day < 10) {
        day = "0" + day
    }
    return year + "-" + month + "-" + day
}

/**
 * 日期字符串转Date
 * 
 * @param {Object} dateStr 日期字符串
 * @param {Object} separator 连接符
 */
function stringToDate(dateStr, separator) {
    if (!separator) {
        separator = "-"
    }
    let dateArr = dateStr.split(separator)
    let year = parseInt(dateArr[0])
    let month
    if (dateArr[1].indexOf("0") == 0) {
        month = parseInt(dateArr[1].substring(1))
    } else {
        month = parseInt(dateArr[1])
    }
    let day = parseInt(dateArr[2])
    let date = new Date(year, month - 1, day)
    return date
}

/**
 * 获取两个日期之间的日期数组
 * 
 * @param {Object} startDate
 * @param {Object} endDate
 */
function getDateRange(startDate, endDate) {
    let dateArray = []
    let currentDate = moment(startDate)
    let stopDate = moment(endDate)
    while (currentDate <= stopDate) {
        dateArray.push(moment(currentDate).format('YYYY-MM-DD'))
        currentDate = moment(currentDate).add(1, 'days')
    }
    return dateArray
}

module.exports = {
    getDateList: getDateList,
    getDateStr: getDateStr,
    stringToDate: stringToDate,
    getDateRange: getDateRange
}
