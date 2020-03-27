<template>
    <view>
        <uni-nav-bar left-icon="back" left-text="返回" title="报餐详情" :fixed="true" :status-bar="true" @clickLeft="back"></uni-nav-bar>
        <view v-if="showQucanCode">
            <view class="uni-flex uni-row" style="margin-top: 10px;">
                <view class="uni-flex-item">
                </view>
                <view class="uni-flex-item">
                    <tki-qrcode ref="qrcode" cid="q1" :val="detail.tradeNo" :size="100" unit="px" loadingText="取餐码生成中" />
                </view>
                <view class="uni-flex-item">
                </view>
            </view>
            <view class="uni-flex uni-row" style="margin: 10px 0;">
                <view class="uni-flex-item">
                </view>
                <view class="uni-flex-item" style="text-align: center;">
                    <text>取餐码</text>
                </view>
                <view class="uni-flex-item">
                </view>
            </view>
        </view>
        <uni-card title="订单信息">
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    订单编号
                </view>
                <view class="uni-flex-item">
                    {{ detail.tradeNo }}
                </view>
            </view>
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    付款时间
                </view>
                <view class="uni-flex-item">
                    {{ detail.orderTime }}
                </view>
            </view>
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    订单状态
                </view>
                <view class="uni-flex-item">
                    {{ detail.status | statusFilter }}
                </view>
            </view>
        </uni-card>
        <uni-card :title="detail.storeName">
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    报餐时间：{{ detail.orderingTime }}
                </view>
            </view>
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    报餐餐次：{{ detail.body }}
                </view>
            </view>
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    用餐日期：{{ detail.orderingTime }}
                </view>
            </view>
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    用餐时间：{{ detail.startTime }}-{{ detail.endTime }}
                </view>
            </view>
        </uni-card>
        <view class="uni-flex uni-row">
            <view class="uni-flex-item">
                报餐金额
            </view>
            <view class="uni-flex-item">
                ￥{{ detail.totalAmount | centFilter }}
            </view>
        </view>
        <view class="uni-flex uni-row">
            <view class="uni-flex-item">
            </view>
            <view class="uni-flex-item">
            </view>
            <view class="uni-flex-item">
                合计：￥{{ detail.totalAmount | centFilter }}
            </view>
        </view>
        <view v-if="showCancel" class="uni-flex uni-row" style="margin-top: 10px;">
            <view class="uni-flex-item">
            </view>
            <view class="uni-flex-item">
                <button class="mini-btn" type="default" size="mini" @click="cancel">取消报餐</button>
            </view>
            <view class="uni-flex-item">
            </view>
        </view>
    </view>
</template>

<script>
    import tkiQrcode from '@/components/tki-qrcode/tki-qrcode'
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
        components: {
            tkiQrcode
        },
        data() {
            return {
                detail: {},
                showQucanCode: false,
                showCancel: false
            }
        },
        methods: {
            back() {
                db.remove('takeDetail')
                uni.navigateBack({
                    delta: 1
                })
            },
            cancel() {
                let that = this
                uni.showModal({
                    title: '提示',
                    content: '确认要取消吗',
                    success: function(res) {
                        if (res.confirm) {
                            let tradeNo = that.detail.tradeNo
                            if (that.detail.status == 'WAIT') {
                                let offerCancelTime = new Date(that.detail.offerCancelTime)
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
                                    tradeNo: tradeNo
                                }).then((res) => {
                                    if (res.data.code == 'SUCCESS') {
                                        uni.showToast({
                                            title: '取消成功',
                                            duration: 2000,
                                            icon: 'success',
                                            complete: function() {
                                                uni.navigateBack({
                                                    delta: 1
                                                })
                                            }
                                        })
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
            }
        },
        onLoad(option) {
            this.detail = db.get('takeDetail')
        },
        onShow() {
            if (this.detail.status == 'WAIT') {
                let offerCancelTime = new Date(this.detail.offerCancelTime)
                if (new Date().getTime() <= offerCancelTime.getTime()) {
                    this.showCancel = true
                } else {
                    this.showCancel = false
                }
                let offerEndTime = new Date(this.detail.offerEndTime)
                if (new Date().getTime() <= offerEndTime.getTime()) {
                    this.showQucanCode = true
                    setTimeout(() => {
                        this.$refs.qrcode._makeCode()
                    }, 1000)
                } else {
                    this.showQucanCode = false
                }
            }
        },
        onUnload() {
            db.remove('takeDetail')
        }
    }
</script>

<style>
</style>
