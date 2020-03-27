<template>
    <view>
        <uni-nav-bar left-icon="back" left-text="返回" :title="rest.storeName" :fixed="true" :status-bar="true"
            @clickLeft="back"></uni-nav-bar>
        <view class="uni-media-list">
            <image class="uni-media-list-logo" src="/static/image/sample.png"></image>
            <view class="uni-media-list-body">
                <view class="uni-media-list-text-top">{{ rest.storeName }}</view>
                <view class="uni-media-list-text-bottom">
                    <text v-for="(bt, i) in rest.businessTime" :key="i">
                        {{ bt.busiName }}: {{bt.startTime}}-{{bt.endTime}}
                    </text>
                </view>
            </view>
        </view>
        <view v-for="(item, index) in list" :key="index">
            <view class="uni-flex uni-row">
                <view>
                    {{ item.weekDay }}
                </view>
                <view>
                    {{ item.date }}
                </view>
            </view>
            <view class="uni-flex uni-row">
                <view class="uni-flex-item" style="margin: 0 30rpx;" v-for="(bt, i) in item.businessTime" :key="i" @click="changeCheck(bt, item.date)">
                    <view v-if="bt.is_order" class="uni-flex uni-column">
                        <view class="uni-flex-item" :class="bt.orderCount > 0 ? 'bt-active' : ''">
                            <image style="width: 50rpx; height: 50rpx;" src="/static/image/sample.png"></image>
                        </view>
                        <view class="uni-flex-item">
                            <text>￥{{ bt.price | centFilter }}</text>
                        </view>      
                        <view class="uni-flex-item">
                            <uni-icons type="checkbox" size="20" :color="!bt.checked?unCheckStyle:checkStyle"></uni-icons>
                            <text>{{ bt.busiName }}</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        <button type="primary" @click="choosePayType">批量报餐</button>
        <uni-popup ref="popup" type="bottom">
            <view style="background-color: #FFFFFF; height: 500rpx;">
                <view class="uni-flex uni-row">
                    <view class="uni-flex-item">
                        <uni-icons type="closeempty" size="30" @click="close"></uni-icons>
                    </view>
                    <view class="uni-flex-item">
                        <text>请选择支付方式</text>
                    </view>
                    <view class="uni-flex-item">
                    </view>
                </view>
                <view style="height: 100rpx; text-align: center;">
                    <text>￥{{ totalMoney | centFilter }}</text>
                </view>

                <view class="uni-flex uni-row" @click="offer">
                    <uni-list>
                        <uni-list-item title="会员卡"></uni-list-item>
                    </uni-list>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script>
    import {
        mapState
    } from 'vuex'
    import util from '@/utils/util'
    import formatter from '@/common/formatter'
    import db from '@/utils/localstorage'   
    import * as math from 'mathjs'

    export default {
        filters: {
            centFilter(cent) {
                if (cent) {
                    return formatter.formatMoney(math.divide(math.number(cent), 100).valueOf())
                }
                return ''
            }
        },
        data() {
            return {
                checkStyle: '#ffaa00',
                unCheckStyle: '#e1e1e1',
                list: [],
                rest: {},
                postData: [],
                totalMoney: 0,
                orderConfig: []
            }
        },
        computed: mapState(['hasBind', 'employee']),
        methods: {
            close() {
                this.$refs.popup.close()
            },
            back() {
                uni.navigateBack({
                    delta: 1
                })
            },
            changeCheck(bt, str) {
                if (!bt.is_order) {
                    uni.showToast({
                        title: '不可报餐',
                        duration: 2000,
                        icon: 'none'
                    })
                    return
                }
                if (bt.isOver) {
                    uni.showToast({
                        title: '报餐已达限制',
                        duration: 2000,
                        icon: 'none'
                    })
                    return
                }
                this.$set(bt, 'checked', !bt.checked)
                let date = this.$moment(str).toDate()
                const config = JSON.parse(this.orderConfig.orderConfig)
                if (config) {
                    const rule = config.find(function(ele) {
                        return bt.busiName == ele.busiName
                    })
                    if (rule) {
                        if (rule.arrange) {
                            const arr = rule.arrange.split('-')
                            const sTime = arr[0].split(':')
                            const eTime = arr[1].split(':')
                            let start = date.setHours(sTime[0], Number(sTime[1]) - Number(rule.endOrderTime))
                            let end = date.setHours(eTime[0], eTime[1])
                            if (new Date().getTime() > start) {
                                this.$set(bt, 'checked', false)
                                uni.showToast({
                                    title: '报餐时间已过',
                                    duration: 2000,
                                    icon: 'none'
                                })
                            }
                        }
                    }
                }
            },
            choosePayType() {
                let data = []
                let totalMoney = 0
                this.list.forEach((item) => {
                    const businessTime = item.businessTime
                    if (businessTime) {
                        businessTime.forEach((bt) => {
                            if (bt.checked) {
                                let obj = {}
                                obj.ordering_time = item.date
                                obj.body = bt.busiName
                                obj.totalAmount = bt.price
                                totalMoney += Number(bt.price)
                                data.push(obj)
                            }
                        })
                    }
                })
                console.log(data)
                this.postData = data
                this.totalMoney = totalMoney
                if (data.length <= 0) {
                    uni.showToast({
                        title: '请选择餐次',
                        duration: 1000,
                        icon: 'none'
                    })
                    return
                }
                this.$refs.popup.open()
            },
            offer() {
                let that = this
                this.$http.post('/wechat/meal/offer.json', {
                    storeId: that.rest.id,
                    mchNo: that.employee.mchNo,
                    buyerId: that.employee.id,
                    offerMealItems: that.postData
                }).then((res) => {
                    console.log(res)
                    if (res.data.code === 'SUCCESS') {
                        that.close()
                        uni.navigateTo({
                            url: '/pages/offer/offer-success?storeName=' + that.rest.storeName +
                                '&totalMoney=' + that.totalMoney
                        })
                        /* this.$Router.push({ path: '/pages/baocan/success', query: { storeName: that.rest.storeName, totalMoney: that.totalMoney } }) */
                    } else {
                        uni.showToast({
                            title: res.data.detail,
                            duration: 1000,
                            icon: 'none'
                        })
                    }
                })
            },
            /**
             * 根据门店id获取报餐配置
             * 
             * @param {Object} id
             */
            getOrderConfig(id) {
                let that = this
                this.$http.get('/wechat/restaurant/orderConfig.json', {
                    data: {
                        restaurantId: id
                    }
                }).then((res) => {
                    if (res.data.entity) {
                        that.getConfigList(res.data.entity)
                        that.orderConfig = res.data.entity
                    }
                })
            },
            /**
             * 根据报餐配置生成报餐列表
             * 
             * @param {Object} orderConfig
             */
            getConfigList(orderConfig) {
                let list = []
                const weekDayList = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
                // orderMode 0按周 1按日期
                if (orderConfig.orderMode === 0) {
                    //先生成当前时间后一周的日期数组
                    let dateList = util.getDateList()
                    dateList.forEach((item) => {
                        let date = new Date(item)
                        let obj = {}
                        obj.date = item
                        obj.weekDay = weekDayList[date.getDay()]
                        const arrangeConfig = JSON.parse(orderConfig.arrangeConfig)
                        let temp = arrangeConfig.find(function(ele) {
                            return ele.date === obj.weekDay
                        })
                        if (temp) {
                            obj.businessTime = temp.businessTime
                        } else {
                            obj.businessTime = []
                        }
                        list.push(obj)
                    })
                } else if (orderConfig.orderMode === 1) {
                    let arr = []
                    //获取日期数组配置
                    const arrangeConfig = JSON.parse(orderConfig.arrangeConfig)
                    arrangeConfig.forEach((item) => {
                        let date = new Date(item.date)
                        let now = new Date(util.getDateStr())
                        if (date.getTime() >= now.getTime()) {
                            let obj = {}
                            obj.date = item.date
                            obj.weekDay = weekDayList[date.getDay()]
                            obj.businessTime = item.businessTime
                            list.push(obj)
                        }
                    })
                }
                //如果生成配置天数大于orderDay截取list的长度为orderDay的大小
                if (orderConfig.orderDay && list.length > orderConfig.orderDay) {
                    list = list.slice(0, orderConfig.orderDay)
                }
                this.getOrderCount(list, JSON.parse(orderConfig.orderConfig))
            },
            //获取已报餐数量
            getOrderCount(list, orderConfig) {
                let that = this
                if (list.length > 0) {
                    this.$httpForm.post('/wechat/meal/count.json', {
                        buyerId: that.employee.id,
                        startTime: list[0].date,
                        endTime: list[list.length - 1].date
                    }).then((res) => {
                        if (res.data.code === 'SUCCESS') {
                            console.log(res.data.rows)
                            that.checkOrderCount(list, orderConfig, res.data.rows)
                        }
                    })
                }
            },
            /**
             * 检测用户报餐次数是否超过限制
             * 
             * @param {Object} list
             * @param {Object} config
             */
            checkOrderCount(list, config, orderCount) {
                let that = this
                list.forEach((item) => {
                    let businessTime = item.businessTime
                    businessTime.forEach((bt) => {
                        bt.checked = false
                        bt.orderCount = 0
                        const a = config.find(function(con) {
                            return bt.busiName == con.busiName
                        })
                        if (a) {
                            bt.price = a.orderMoney                 
                            const b = orderCount.find(function(ele) {
                                const orderingTime = that.$moment(new Date(ele.orderingTime)).format('YYYY-MM-DD')
                                return item.date == orderingTime && ele.busiName == bt.busiName
                            })
                            if (b) {
                                bt.orderCount = b.orderCount
                                if (b.orderCount < a.orderMax) {
                                    bt.isOver = false
                                } else {
                                    bt.isOver = true
                                }
                            }
                        }
                    })
                })
                this.list = list
            }
        },
        onLoad(option) {
            this.rest = db.get('rest')
        },
        onShow() {
            this.getOrderConfig(this.rest.id)
        }
    }
</script>

<style>
    .bt-active {
        background-color: #FFA200;
    }
    
    .uni-media-list-logo {
        width: 180rpx;
        height: 180rpx;
    }

    .uni-media-list-body {
        height: auto;
        justify-content: space-around;
    }

    .uni-media-list-text-top {
        height: 74rpx;
        font-size: 28rpx;
        overflow: hidden;
    }

    .uni-media-list-text-bottom {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .popup-content {
        /* #ifndef APP-NVUE */
        display: block;
        /* #endif */
        background-color: #fff;
        padding: 15px;
        font-size: 14px;
    }
</style>
