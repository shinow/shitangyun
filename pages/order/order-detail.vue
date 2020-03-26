<template>
    <view>
        <uni-nav-bar left-icon="back" left-text="返回" title="订单详情" :fixed="true" :status-bar="true" @clickLeft="back"></uni-nav-bar>

        <view v-if="showOrderCode">
            <view class="uni-flex uni-row" style="margin-top: 10px;">
                <view class="uni-flex-item">
                </view>
                <view class="uni-flex-item">
                    <tki-qrcode ref="qrcode" cid="q1" :val="detail.tradeNo" :size="100" unit="px" loadingText="查询码生成中" />
                </view>
                <view class="uni-flex-item">
                </view>
            </view>
            <view class="uni-flex uni-row" style="margin: 10px 0;">
                <view class="uni-flex-item">
                </view>
                <view class="uni-flex-item" style="text-align: center;">
                    <text>订餐查询码</text>
                </view>
                <view class="uni-flex-item">
                </view>
            </view>
        </view>
        
        <view v-if="showAddress">
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    <uni-icons type="location-filled" size="30"></uni-icons>
                </view>
                <view class="uni-flex-item">
                    <view class="uni-flex uni-column">
                        <view class="uni-flex-item">
                            {{ address.detail }}
                        </view>
                        <view class="uni-flex-item">
                            {{ address.contact }}{{ address.phone }}
                        </view>
                    </view>
                </view>
                <view class="uni-flex-item"></view>
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
                    下单时间
                </view>
                <view class="uni-flex-item">
                    {{ detail.orderTime }}
                </view>
            </view>
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    支付时间
                </view>
                <view class="uni-flex-item">
                    {{ detail.tradeTime }}
                </view>
            </view>
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    取餐时间
                </view>
                <view class="uni-flex-item">
                    {{ detail.orderingTime }} {{ detail.startTime }}-{{ detail.endTime }}
                </view>
            </view>
        </uni-card>
        <uni-card :title="detail.storeName">
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    预约时间：{{ detail.orderingTime }}
                </view>
            </view>
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    预约餐次：{{ detail.body }}
                </view>
            </view>
            <view class="uni-flex uni-row">
                <view class="uni-flex-item">
                    取餐方式：{{ getOrderMode(detail.attach) }}
                </view>
            </view>
        </uni-card>
        <view class="uni-flex uni-row" v-for="(item, index) in foodList" :key="index">
            <view class="uni-flex-item">
                <image style="width: 100rpx; height: 100rpx;" src="/static/image/sample.png"></image>
            </view>
            <view class="uni-flex-item">
                {{ item.name }}
            </view>
            <view class="uni-flex-item">
                x{{ item.num }}
            </view>
            <view class="uni-flex-item">
                ￥{{ getFoodTotalPrice(item) | moneyFilter }}
            </view>
        </view>
        <view class="uni-flex uni-row">
            <view class="uni-flex-item">
                打包费
            </view>
            <view class="uni-flex-item">
            </view>
            <view class="uni-flex-item">
                ￥{{ packFee | moneyFilter }}
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
        <view class="uni-flex uni-row">
            <view class="uni-flex-item">
                备注
            </view>
            <view class="uni-flex-item">

            </view>
            <view class="uni-flex-item">
                {{ remark }}
            </view>
        </view>
        <view v-if="showCancel" class="uni-flex uni-row" style="margin-top: 10px;">
            <view class="uni-flex-item">
            </view>
            <view class="uni-flex-item">
                <button class="mini-btn" type="default" size="mini" @click="cancel">取消订单</button>
            </view>
            <view class="uni-flex-item">
            </view>
        </view>
    </view>
</template>

<script>
    import util from '@/utils/util'
    import db from '@/utils/localstorage'
    import formatter from '@/common/formatter'
    import * as math from 'mathjs'
    import tkiQrcode from '@/components/tki-qrcode/tki-qrcode'

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
            moneyFilter(money) {
                return formatter.formatMoney(money)
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
                showOrderCode: false,
                showAddress: false,
                showCancel: false,
                foodList: [],
                remark: '',
                address: {}
            }
        },
        computed: {
            packFee() {
                let packFee = 0
                for (let i in this.foodList) {
                    packFee = math.add(packFee, math.multiply(math.bignumber(this.foodList[i].packFee), this.foodList[i]
                        .num)).valueOf()
                }
                return packFee
            }
        },
        methods: {
            back() {
                db.remove('orderDetail')
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
                                let reserveCancelTime = new Date(that.detail.reserveCancelTime)
                                //如果当前时间超过取消报餐时间,显示通知
                                if (new Date().getTime() > reserveCancelTime.getTime()) {
                                    uni.showToast({
                                        title: '取消报餐时间已过',
                                        duration: 2000,
                                        icon: 'none'
                                    })
                                    return
                                }
                                that.$httpForm.post('/wechat/order/cancel.json', {
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
            getFoodTotalPrice(item) {
                return math.multiply(math.bignumber(item.realPrice), item.num).valueOf()
            }
        },
        onLoad(option) {
            this.detail = db.get('orderDetail')
            if (this.detail.attach) {
                const attach = JSON.parse(this.detail.attach)
                this.foodList = attach.foodList
                this.remark = attach.remark
            }
        },
        onShow() {
            if (this.detail.status == 'WAIT') {  
                  let reserveCancelTime = new Date(this.detail.reserveCancelTime)
                  if (new Date().getTime() <= reserveCancelTime.getTime()) {
                      this.showCancel = true
                  } else {
                      this.showCancel = false
                  }      
            }
            const info = JSON.parse(this.detail.attach)
            const orderMode = info.orderMode.orderMode
            //订餐模式不为配送时生成订单查询码
            if (orderMode != '3') {
                this.showAddress = false
                let reserveEndTime = new Date(this.detail.reserveEndTime)
                if (new Date().getTime() <= reserveEndTime.getTime()) {
                    this.showOrderCode = true
                    setTimeout(() => {
                        this.$refs.qrcode._makeCode()
                    }, 1000)
                } else {
                    this.showOrderCode = false
                }
            } else {
                this.address = info.address
                this.showAddress = true
            } 
        },
        onUnload() {
            db.remove('orderDetail')
        }
    }
</script>

<style>
</style>
