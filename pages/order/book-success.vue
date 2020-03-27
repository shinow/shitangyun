<template>
    <view>
        <uni-nav-bar left-icon="back" left-text="返回" title="支付成功" :fixed="true" :status-bar="true" @clickLeft="back"></uni-nav-bar>
        <view class="uni-flex uni-column">
            <view class="uni-flex-item">
                <icon type="success" size="26" />
            </view>
            <view class="uni-flex-item">
                <text>支付成功</text>
            </view>
            <view class="uni-flex-item">
                <text>￥ {{ totalMoney | moneyFilter }}</text>
            </view>
            <view class="uni-flex-item">
                <text>预约餐厅：{{ storeName }}</text>
            </view>
            <view class="uni-flex-item">
                <text>预约时间：{{ orderDate }}</text>
            </view>
            <view class="uni-flex-item">
                <text>预约餐次：{{ busiName }}</text>
            </view>
            <view class="uni-flex-item">
                <button class="mini-btn" type="primary" size="mini" @click="continueBook">继续预约该餐厅</button>
            </view>
            <view class="uni-flex-item">
                <button class="mini-btn" type="default" size="mini" @click="toIndex">完成预约</button>
            </view>
        </view>
    </view>
</template>

<script>
    import formatter from '@/common/formatter'

    export default {
        filters: {
            moneyFilter(totalMoney) {
                return formatter.formatMoney(totalMoney, '#0.00')
            }
        },
        data() {
            return {
                storeName: '',
                orderDate: '',
                busiName: '',
                totalMoney: 0
            }
        },
        methods: {
            back() {
                uni.navigateBack({
                    delta: 1
                })
            },
            continueBook() {
                uni.redirectTo({
                    url: '/pages/order/book-time'
                })
            },
            toIndex() {
                uni.reLaunch({
                    url: '/pages/index/index'
                })
            }
        },
        onLoad(option) {
            if (option) {
                this.storeName = option.storeName
                this.orderDate = option.orderDate
                this.busiName = option.busiName
                this.totalMoney = option.totalMoney
            }
        }
    }
</script>

<style>
</style>
