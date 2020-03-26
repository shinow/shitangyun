<template>
    <view>
        <uni-nav-bar left-icon="back" left-text="返回" title="报餐取餐" :fixed="true" :status-bar="true" @clickLeft="back"></uni-nav-bar>
        <picker mode="date" :value="date" @change="bindDateChange">
            <view class="uni-input">{{ date }}</view>
        </picker>
        <view class="uni-list" v-for="(item, index) in listData" :key="index">
            <view class="uni-list-cell">
                <text>{{ item.orderingTime }}</text><text>{{ item.body }}</text><text>{{ item.status | statusFilter }}</text>
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
                                    <text>￥{{ item.totalAmount | moneyFilter }}</text>
                                </view>
                            </view>
                        </view>
                        <view class="uni-media-list-text-bottom">
                            <button v-if="showCancel(item)" class="mini-btn" type="default" size="mini" @click="cancel(item)">取消报餐</button>
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
            moneyFilter(totalAmount) {
                return formatter.formatMoney(math.chain(totalAmount).divide(100).done())
            }
        },
        data() {
            return {
                date: formatter.formatDate(new Date(), "yyyy-MM-dd"),
                listData: []
            }
        },
        computed: mapState(['employee']),
        methods: {
            back() {
                uni.navigateBack({
                    delta: 1
                })
            },
            detail(item) {
                db.save('qucanDetail', item)
                uni.navigateTo({
                    url: '/pages/qucan/detail'
                })
            },
            // 取消报餐
            cancel(item) {
                let that = this
                uni.showModal({
                    title: '提示',
                    content: '确认要取消吗',
                    success: function(res) {
                        if (res.confirm) {
                            if (item.status == 'WAIT') {
                                let offerCancelTime = new Date(item.offerCancelTime)
                                //如果当前时间超过取消报餐时间,显示通知
                                if (new Date().getTime() > offerCancelTime.getTime()) {
                                    uni.showToast({
                                        title: '取消报餐时间已过',
                                        duration: 2000,
                                        icon: 'none'
                                    })
                                    return
                                }
                                that.$httpForm.post('/wechat/meal/cancel.json', {
                                    tradeNo: item.tradeNo
                                }).then((res) => {
                                    if (res.data.code == 'SUCCESS') {
                                        uni.showToast({
                                            title: '取消成功',
                                            duration: 2000,
                                            icon: 'success'
                                        })
                                        that.getMealList()
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
            showCancel(item) {
                if (item.status == 'WAIT') {
                    let offerCancelTime = new Date(item.offerCancelTime)
                    //如果当前时间超过取消报餐时间,则不显示取消报餐按钮
                    if (new Date().getTime() > offerCancelTime.getTime()) {
                        return false
                    }
                    return true
                } else {
                    return false
                }
            },
            bindDateChange(e) {
                this.date = e.target.value
                this.getMealList()
            },
            // 获取用户报餐列表
            getMealList() {
                let that = this
                this.listData = []
                this.$httpForm.post('/wechat/meal/offerMealList.json', {
                    buyerId: that.employee.id,
                    ordering_time: that.$moment(that.date).toDate()
                }).then((res) => {
                    if (res.data.rows) {
                        that.listData = res.data.rows
                    }
                })
            }
        },
        onLoad() {
            this.getMealList()
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
