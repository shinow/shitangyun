<template>
    <view>
        <uni-nav-bar left-icon="back" left-text="返回" title="确认订单" :fixed="true" :status-bar="true" @clickLeft="back"></uni-nav-bar>
        <view class="uni-flex uni-row">
            <view v-if="item.status" class="uni-flex-item" :class="item.checked?'order-mode-active':''" v-for="(item, index) in modeList"
                :key="index" @click="checkOrderMode(index)">
                <uni-icons :type="getOrderModeIcon(item.orderMode)" size="30"></uni-icons>
                <text>{{ item.orderMode | orderModeFilter }}</text>
            </view>
        </view>
        
        <view v-if="currentOrderMode == '3'" class="uni-flex uni-column" style="margin: 30rpx 0;" @click="toAddress">
            <view v-if="showAddress" class="uni-flex-item">
                <view class="uni-flex uni-row">
                    <view class="uni-flex-item">
                        <text>{{ address.detail }}</text>
                    </view>
                </view>
                <view class="uni-flex uni-row">
                    <view class="uni-flex-item">
                        <text>{{ address.contact }}</text>
                    </view>
                    <view class="uni-flex-item">
                        <text>{{ address.phone }}</text>
                    </view>
                </view>
            </view>
            <view v-else class="uni-flex-item">
                <text style="color: #D9D9D9;">请填写配送地址</text>
            </view>
        </view>

        <view class="uni-flex uni-row">
            <view class="uni-flex-item">
                {{ rest.storeName }}
            </view>
        </view>
        <view class="uni-flex uni-row">
            <view class="uni-flex-item">
                预约时间：{{ orderDate }}
            </view>
        </view>
        <view class="uni-flex uni-row">
            <view class="uni-flex-item">
                预约餐次：{{ busiName }}
            </view>
        </view>
        <view class="uni-flex uni-row" v-if="currentOrderMode">
            <view class="uni-flex-item">
                取餐方式：{{ currentOrderMode | orderModeFilter }}
            </view>
        </view>

        <view class="uni-flex uni-column" v-for="(item2, index2) in cartFood" :key="index2">
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    <image src="/static/image/sample.png" style="width: 100rpx; height: 100rpx;"></image>
                </view>
                <view class="uni-flex-item">{{ item2.name }}</view>
                <view class="uni-flex-item">x{{ item2.num }}</view>
                <view class="uni-flex-item">￥{{ item2.realPrice | moneyFilter }}</view>
            </view>
        </view>

        <view class="uni-flex uni-column" v-if="currentOrderMode && currentOrderMode != '1'">
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">打包费</view>
                <view class="uni-flex-item"></view>
                <view class="uni-flex-item"></view>
                <view class="uni-flex-item">￥{{ packFee | moneyFilter }}</view>
            </view>
        </view>

        <view class="uni-flex uni-column">
            <view class="uni-flex uni-row">
                <view class="uni-flex-item"></view>
                <view class="uni-flex-item"></view>
                <view class="uni-flex-item"></view>
                <view class="uni-flex-item">合计：￥{{ totalMoney | moneyFilter }}</view>
            </view>
        </view>

        <view class="uni-flex uni-column" style="margin-top: 30rpx;" @click="toRemark()">
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">备注</view>
                <view class="uni-flex-item"></view>
                <view class="uni-flex-item" v-if="remark == ''" style="color: #D9D9D9;text-align: right;">点击填写备注</view>
                <view class="uni-flex-item" v-else style="color: #D9D9D9;text-align: right;">{{ remark }}</view>
                <view class="uni-flex-item">
                    <uni-icons type="forward" color="#D9D9D9" size="15"></uni-icons>
                </view>
            </view>
        </view>

        <view class="uni-flex uni-column pay-bottom">
            <view class="uni-flex uni-row">
                <view class="uni-flex-item" style="color: #F76260;">￥{{ totalMoney | moneyFilter }}</view>
                <view class="uni-flex-item"></view>
                <view class="uni-flex-item"></view>
                <view class="uni-flex-item">
                    <button class="mini-btn" type="primary" size="mini" @click="confirm">确认支付</button>
                </view>
            </view>
        </view>

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
                    <text>￥{{ totalMoney | moneyFilter }}</text>
                </view>

                <view class="uni-flex uni-row">
                    <uni-list>
                        <uni-list-item title="会员卡" @click="book"></uni-list-item>
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
    import db from '@/utils/localstorage'
    import * as math from 'mathjs'
    import formatter from '@/common/formatter'

    export default {
        filters: {
            orderModeFilter(orderMode) {
                const map = {
                    '1': '堂食',
                    '2': '自提',
                    '3': '配送'
                }
                return map[orderMode]
            },
            moneyFilter(money) {
                return formatter.formatMoney(money)
            }
        },
        data() {
            return {
                //门店信息
                rest: {},
                //门店配置
                restConfig: {},
                //预约时间
                orderDate: '',
                //餐次
                busiName: '',
                //已选商品
                cartFood: [],
                //订餐模式列表
                modeList: [],
                //已选中订餐模式
                orderMode: {},
                //备注
                remark: '',
                //配送地址
                address: {},
                currentOrderCount: []
            }
        },
        computed: {
            ...mapState(['employee']),
            //当前选中订餐模式 1堂食 2自提 3配送
            currentOrderMode() {
                let orderMode = ''
                for (let i in this.modeList) {
                    if (this.modeList[i].checked) {
                        orderMode = this.modeList[i].orderMode
                    }
                }
                return orderMode
            },
            //打包费总计
            packFee() {
                let packFee = 0
                for (let i in this.cartFood) {
                    packFee = math.add(packFee, math.multiply(math.bignumber(this.cartFood[i].packFee), this.cartFood[i].num)).valueOf()
                }
                return packFee
            },
            //商品金额总计
            totalMoney() {
                let totalMoney = 0
                for (let i in this.cartFood) {
                    totalMoney = math.add(math.bignumber(totalMoney), math.multiply(math.bignumber(this.cartFood[i].realPrice), this.cartFood[i].num)).valueOf()
                }
                if (this.currentOrderMode && this.currentOrderMode != '1') {
                    totalMoney = math.add(math.bignumber(totalMoney), math.bignumber(this.packFee)).valueOf()
                }
                return totalMoney
            },
            showAddress() {
                if (this.address.detail) {
                    return true
                }
                return false
            }
        },
        methods: {
            back() {
                db.remove('remark')
                db.remove('cartFood')
                uni.navigateBack({
                    delta: 1
                })
            },
            toAddress() {
                uni.navigateTo({
                    url: '/pages/order/book-address'
                })
            },
            toRemark() {
                uni.navigateTo({
                    url: '/pages/order/book-remark'
                })
            },
            close() {
                this.$refs.popup.close()
            },
            confirm() {
                let that = this
                if (this.currentOrderMode == '') {
                    uni.showToast({
                        title: '请选择取餐方式',
                        icon: 'none',
                        duration: 2000
                    })
                    return
                } else if (this.currentOrderMode == '3') {
                    if (!this.address.detail) {
                        uni.showToast({
                            title: '请填写配送地址',
                            icon: 'none',
                            duration: 2000
                        })
                        return
                    }
                }
                const temp = this.currentOrderCount.find(function(ele) {
                    return ele.busiName == that.busiName
                })
                //判断订餐份数是否超过限制
                if (temp) {
                    if (temp.orderCount >= this.restConfig.orderNum) {
                        uni.showToast({
                            title: '订餐份数超过限制',
                            icon: 'none',
                            duration: 2000
                        })
                        return
                    }
                }
                this.$refs.popup.open()
            },
            //订餐
            book() {
                let that = this
                let attach = {}
                attach.orderMode = this.orderMode
                attach.address = this.address
                attach.foodList = this.cartFood
                attach.remark = this.remark
                this.$httpForm.post('/wechat/order/book.json', {
                    storeId: that.rest.id,
                    mchNo: that.employee.mchNo,
                    buyerId: that.employee.id,
                    body: that.busiName,
                    attach: JSON.stringify(attach),
                    totalAmount: math.multiply(that.totalMoney, 100),
                    ordering_time: that.orderDate
                }).then((res) => {
                    if (res.data.code === 'SUCCESS') {
                        that.close()
                        db.remove('remark')
                        uni.navigateTo({
                            url: '/pages/order/book-success?storeName=' + that.rest.storeName +
                                '&orderDate=' + that.orderDate + '&busiName=' + that.busiName +
                                '&totalMoney=' + that.totalMoney
                        })
                    } else {
                        uni.showToast({
                            title: res.data.detail,
                            duration: 2000,
                            icon: 'none'
                        })
                    }
                })
            },
            //订餐模式选中事件
            checkOrderMode(index) {
                for (let i in this.modeList) {
                    this.modeList[i].checked = false
                }
                this.modeList[index].checked = true
                this.orderMode = this.modeList[index]
            },
            getOrderModeIcon(orderMode) {
                const map = {
                    '1': 'shop',
                    '2': 'locked',
                    '3': 'loop'
                }
                return map[orderMode]
            },
            //初始化订餐模式
            initOrderMode(restConfig) {
                let that = this
                const orderMode = JSON.parse(restConfig.orderMode)
                const obj = orderMode.find(function(ele) {
                    return ele.busiName == that.busiName
                })
                if (obj) {
                    const modeList = obj.modeList
                    modeList.forEach((item) => {
                        item.checked = false
                    })
                    this.modeList = modeList
                }
            },
            /**
             * 根据门店id获取订餐配置
             * 
             * @param {Object} id
             */
            getRestaurantConfig(id) {
                let that = this
                this.$http.get('/wechat/restaurant/restConfig.json', {
                    data: {
                        restaurantId: id
                    }
                }).then((res) => {
                    if (res.data.entity) {
                        that.restConfig = res.data.entity
                        that.initOrderMode(res.data.entity)
                    }
                })
            },
            //获取职工配送地址
            getAddress() {
                let that = this
                this.$http.get('/wechat/employee/getAddress.json', {
                    data: {
                        employeeId: that.employee.id
                    }
                }).then((res) => {
                    if (res.data.entity) {
                        that.address.detail = res.data.entity.detail
                        that.address.contact = res.data.entity.contact
                        that.address.phone = res.data.entity.phone
                        that.$forceUpdate()
                    }
                })
            },
            //获取本次预约日期的订餐数量
            getOrderCount(orderDate) {
                let that = this
                this.$httpForm.post('/wechat/order/count.json', {
                    buyerId: that.employee.id,
                    startTime: orderDate,
                    endTime: orderDate
                }).then((res) => {
                    if (res.data.code === 'SUCCESS') {
                        that.currentOrderCount = res.data.rows || []
                    }
                })
            }
        },
        onLoad() {
            const rest = db.get('rest')
            this.rest = rest
            const cartInfo = db.get('cartInfo')
            this.orderDate = cartInfo.orderDate
            this.busiName = cartInfo.busiName
            this.cartFood = cartInfo.cartFood
            this.getRestaurantConfig(this.rest.id)
        },
        onShow() {
            const remark = db.get('remark', '')
            this.remark = remark
            this.getAddress()
            this.getOrderCount(this.orderDate)
        }
    }
</script>

<style>
    .order-mode-active {
        background-color: #D8D8D8;
    }

    .pay-bottom {
        width: 100%;
        position: fixed;
        bottom: 0;
    }
</style>
