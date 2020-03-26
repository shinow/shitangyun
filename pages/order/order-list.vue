<template>
    <view>
        <uni-nav-bar left-icon="back" left-text="返回" title="订餐列表" :fixed="true" :status-bar="true" @clickLeft="back"></uni-nav-bar>

        <view class="uni-list" v-for="(item, index) in list" :key="index">
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    <text>{{ item.orderingTime }}</text>
                </view>
                <view class="uni-flex-item">
                    <text>{{ item.body }}</text>
                </view>
                <view class="uni-flex-item">
                    {{ getOrderMode(item.attach) }}
                </view>
                <view class="uni-flex-item">
                    <text>({{ item.status | statusFilter }})</text>
                </view>
            </view>
            <view class="uni-list-cell" hover-class="uni-list-cell-hover">
                <view class="uni-media-list">
                    <image class="uni-media-list-logo" src="/static/image/sample.png"></image>
                    <view class="uni-media-list-body">
                        <view class="uni-media-list-text-top">
                            <view class="uni-flex uni-column">
                                <view class="uni-flex-item">
                                    <text>{{ item.storeName }}</text>
                                </view>
                                <view class="uni-flex-item">
                                    <text>￥{{ item.totalAmount | centFilter }}</text>
                                </view>
                            </view>
                        </view>
                        <view class="uni-media-list-text-bottom">
                            <button v-if="showCancel(item)" class="mini-btn" type="default" size="mini" @click="cancel(item)">取消订餐</button>
                            <button class="mini-btn" type="primary" size="mini" @click="detail(item)">查看详情</button>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    import {
        mapState
    } from 'vuex'
    import util from '@/utils/util'
    import db from '@/utils/localstorage'
    import formatter from '@/common/formatter'
    import * as math from 'mathjs'

    export default {
        filters: {
            statusFilter(status) {
                const map = {
                    'WAIT': '待取餐',
                    'RECEIVE': '已取餐',
                    'CANCEL': '已取消',
                    'REFUND': '已退款'
                }
                return map[status]
            },
            centFilter(cent) {
                return formatter.formatMoney(math.chain(cent).divide(100).done())
            }
        },
        data() {
            return {
                orderDate: '',
                list: []
            }
        },
        computed: mapState(['employee']),
        methods: {
            back() {
                uni.navigateBack({
                    delta: 1
                })
            },
            showCancel(item) {
                if (item.status == 'WAIT') {
                    let reserveCancelTime = new Date(item.reserveCancelTime)
                    //如果当前时间超过取消订餐时间,则不显示取消订餐按钮
                    if (new Date().getTime() > reserveCancelTime.getTime()) {
                        return false
                    }
                    return true
                } else {
                    return false
                }
            },
            //取消订餐
            cancel(item) {
                let that = this
                uni.showModal({
                    title: '提示',
                    content: '确认要取消吗',
                    success: function(res) {
                        if (res.confirm) {
                            if (item.status == 'WAIT') {
                                let reserveCancelTime = new Date(item.reserveCancelTime)
                                //如果当前时间超过取消报餐时间,显示通知
                                if (new Date().getTime() > reserveCancelTime.getTime()) {
                                    uni.showToast({
                                        title: '取消订餐时间已过',
                                        duration: 2000,
                                        icon: 'none'
                                    })
                                    return
                                }
                                that.$httpForm.post('/wechat/order/cancel.json', {
                                    tradeNo: item.tradeNo
                                }).then((res) => {
                                    console.log(res)
                                    if (res.data.code == 'SUCCESS') {
                                        uni.showToast({
                                            title: '取消成功',
                                            duration: 2000,
                                            icon: 'success'
                                        })
                                        that.getOrderList(that.orderDate)
                                    } else {
                                        uni.showToast({
                                            title: res.data.detail,
                                            duration: 2000,
                                            icon: 'none'
                                        })
                                    }
                                })
                            } else {
                                uni.showToast({
                                    title: '不可取消,状态已变更',
                                    duration: 2000,
                                    icon: 'none'
                                })
                            }
                        }
                    }
                })
            },
            detail(item) {
                db.save('orderDetail', item)
                uni.navigateTo({
                    url: '/pages/order/order-detail'
                })
            },
            getOrderMode(attach) {
                const map = {
                    '1': '堂食',
                    '2': '自提',
                    '3': '配送'
                }
                const info = JSON.parse(attach)
                return map[info.orderMode.orderMode]
            },
            // 获取用户订餐列表
            getOrderList(orderDate) {
                let that = this
                this.list = []
                this.$httpForm.post('/wechat/order/list.json', {
                    buyerId: that.employee.id,
                    ordering_time: that.$moment(orderDate).toDate()
                }).then((res) => {
                    if (res.data.rows) {
                        that.list = res.data.rows
                    }
                })
            }
        },
        onLoad(option) {
            if (option) {
                this.orderDate = option.orderDate
            }
        },
        onShow() {
            this.getOrderList(this.orderDate)
        }
    }
</script>

<style>
    .uni-media-list-logo {
        width: 180rpx;
        height: 180rpx;
    }

    .uni-media-list-body {
        height: auto;
        justify-content: space-around;
    }

    .uni-media-list-text-top {
        height: 90rpx;
        font-size: 28rpx;
        overflow: hidden;
    }

    .uni-media-list-text-bottom {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
</style>
