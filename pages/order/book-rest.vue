<template>
    <view>
        <uni-nav-bar left-icon="back" left-text="返回" title="预约订单" :fixed="true" :status-bar="true" @clickLeft="back"></uni-nav-bar>
        
        <uni-popup ref="takeCode" type="center" :maskClick="false">
            <view style="width: 600rpx;height: 900rpx;margin: 50rpx 40rpx;background-color: #F0F0F0;">
                <view class="close">
                    <uni-icons @click="close" type="closeempty" size="30"></uni-icons>
                </view>
                <view class="uni-flex uni-row">
                    <view class="uni-flex-item">
                        
                    </view>
                    <view class="uni-flex-item">
                        <tki-qrcode ref="qrcode" cid="takeCode" :val="takeCodeContent" :size="150" unit="px" :onval="true" :showLoading="false" />
                    </view>
                    <view class="uni-flex-item">
                        
                    </view> 
                </view>
            </view>
        </uni-popup>
        
        <view class="uni-flex uni-row">
            <view class="uni-flex-item" @click="showTakeCode">
                <view style="text-align: center; padding: 10px 0;">
                    <text>取餐码</text>
                </view>
            </view>
            <view class="uni-flex-item" @click="toMyOrder">
                <view style="text-align: center; padding: 10px 0;">
                    <text>我的预约</text>
                </view>
            </view>
        </view>
        <view class="uni-list">
            <view class="uni-list-cell" hover-class="uni-list-cell-hover" v-for="(item, key) in listData" :key="key">
                <view class="uni-media-list" @click="detail(item)">
                    <image class="uni-media-list-logo" src="/static/image/sample.png"></image>
                    <view class="uni-media-list-body">
                        <view class="uni-media-list-text-top">{{ item.storeName }}</view>
                        <view class="uni-media-list-text-bottom">
                            <text v-for="(bt, i) in item.businessTime" :key="i">
                                {{ bt.busiName }}: {{bt.startTime}}-{{bt.endTime}}
                            </text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        <uni-load-more :status="status" :icon-size="16" :content-text="contentText" />
    </view>
</template>

<script>
    import db from '@/utils/localstorage'
    import tkiQrcode from '@/components/tki-qrcode/tki-qrcode'

    export default {
        components: { tkiQrcode },
        data() {
            return {
                listData: [],
                pageNumber: 1,
                pageSize: 0,
                status: 'more',
                contentText: {
                    contentdown: '上拉加载更多',
                    contentrefresh: '加载中',
                    contentnomore: '没有更多'
                },
                takeCodeContent: '',
                intervalID: 0
            }
        },
        methods: {
            back() {
                uni.navigateBack({
                    delta: 1
                })
            },
            close() {
                clearInterval(this.intervalID)
                this.$refs.qrcode._clearCode()
                this.$refs.takeCode.close()
            },
            showTakeCode() {
                let that = this
                this.$refs.takeCode.open()
                this.takeCodeContent = new Date().getTime() + ''
                setTimeout(() => {
                    that.$refs.qrcode._makeCode()
                    const intervalID = setInterval(() => {
                        that.takeCodeContent =  new Date().getTime() + ''
                        console.log(that.takeCodeContent)
                    }, 1000 * 10)
                    that.intervalID = intervalID
                }, 1000)    
            },
            toMyOrder() {
                uni.navigateTo({
                    url: '/pages/order/my-order'
                })
            },
            detail(item) {
                if (item.bookFlag == 0) {
                    uni.showToast({
                        title: '该门店暂未开通订餐',
                        icon: 'none',
                        duration: 2000
                    })
                    return
                }
                db.save('rest', item)
                uni.navigateTo({
                    url: '/pages/order/book-time'
                })
            },
            getRestList() {
                let that = this
                this.$http.get('/wechat/restaurant/list.json', {
                    data: {
                        mchId: 5027069,
                        pageNumber: that.pageNumber
                    }
                }).then((res) => {
                    that.pageSize = res.data.total
                    that.listData = that.listData.concat(res.data.rows)
                    if (this.pageSize <= 1) {
                        this.status = 'noMore'
                    }
                }).catch((err) => {
                    console.log(err)
                })
            },
            onLoad() {
                this.pageNumber = 1
                this.listData = []
                this.getRestList()
            },
            onReachBottom() {
                if (this.pageNumber < this.pageSize) {
                    this.pageNumber++
                    this.getRestList()
                } else {
                    this.status = 'noMore'
                }
            }
        }
    }
</script>

<style>
    .close {
        position: relative;
        float: right;
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
</style>
