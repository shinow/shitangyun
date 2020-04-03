<template>
    <view>
        <view class="title">
            <text v-if="hasBind">{{ employee.mchName }}</text>
        </view>
        <view class="menu-card">
            <view class="uni-flex uni-row">
                <view class="uni-flex uni-column">
                    <view class="card-item">{{ hasBind ? employee.name : wxUserInfo.nickname }}</view>
                    <view v-if="hasBind" class="card-item">
                        工号：<text>{{ employee.phone }}</text>
                    </view>
                    <view v-if="hasBind" class="card-item">
                        证件号：<text>{{ employee.idcard }}</text>
                    </view>
                    <view class="card-item">
                        <button v-if="hasBind" class="mini-btn" type="default" size="mini" @click="bind">解绑</button>
                        <button v-else class="mini-btn" type="default" size="mini" @click="bind">绑定</button>
                    </view>
                </view>
                <view class="uni-flex uni-column" style="-webkit-flex: 1; flex: 1; align-items: flex-end; padding: 10rpx 20rpx 0 0;">
                    <image style="width: 80rpx; height: 80rpx;" src="/static/image/sample.png"></image>
                    <text>二维码</text>
                </view>
            </view>

            <view class="uni-flex uni-row">
                <view class="uni-flex uni-column">
                    <view class="card-item">{{ hasBind ? qbBalance : '0.00' }}</view>
                    <view class="card-item">充值钱包余额（元）</view>
                </view>
                <view class="uni-flex uni-column">
                    <view class="card-item">{{ hasBind ? tbBalance : '0.00' }}</view>
                    <view class="card-item">补助钱包余额（元）</view>
                </view>
            </view>
        </view>
        <view style="width: 100%; height: 10px; background-color: #ECECEC;"></view>
        <uni-grid :showBorder="false">
            <uni-grid-item v-for="(item, index) in menuList" :key="index">
                <view class="grid-item-box" @click="go(item.url)">
                    <image :src="item.icon" class="image"></image>
                    <text class="text">{{ item.name }}</text>
                </view>
            </uni-grid-item>
        </uni-grid>
    </view>
</template>

<script>
    import {
        mapState
    } from 'vuex'
    import formatter from '@/common/formatter'

    export default {
        data() {
            return {
                menuList: [{
                        name: '报餐',
                        icon: '/static/image/sample.png',
                        url: '/pages/offer/offer-rest'
                    },
                    {
                        name: '报餐取餐',
                        icon: '/static/image/sample.png',
                        url: '/pages/take/take-list'
                    },
                    {
                        name: '预约订餐',
                        icon: '/static/image/sample.png',
                        url: '/pages/order/book-rest'
                    },
                    {
                        name: '领取补助',
                        icon: '/static/image/sample.png',
                        url: '/static/image/sample.png'
                    },
                    {
                        name: '问卷调查',
                        icon: '/static/image/sample.png',
                        url: '/pages/baocan/baocan'
                    },
                    {
                        name: '一卡通查询',
                        icon: '/static/image/sample.png',
                        url: '/pages/baocan/baocan'
                    },
                    {
                        name: '资讯公告',
                        icon: '/static/image/sample.png',
                        url: '/pages/baocan/baocan'
                    },
                    {
                        name: '订单',
                        icon: '/static/image/sample.png',
                        url: '/pages/baocan/baocan'
                    },
                    {
                        name: '人脸验证',
                        icon: '/static/image/sample.png',
                        url: '/static/image/sample.png'
                    },
                    {
                        name: '密码修改',
                        icon: '/static/image/sample.png',
                        url: '/static/image/sample.png'
                    },
                    {
                        name: '挂失解挂',
                        icon: '/static/image/sample.png',
                        url: '/static/image/sample.png'
                    },
                    {
                        name: '健康打卡',
                        icon: '/static/image/sample.png',
                        url: '/static/image/sample.png'
                    }
                ],
                qbBalance: '',
                tbBalance: ''
            }
        },
        computed: mapState(['hasBind', 'wxUserInfo', 'employee']),
        methods: {
            go(url) {
                uni.navigateTo({
                    url: url
                })
            },
            bind() {
                uni.navigateTo({
                    url: '/pages/bind/bind'
                })
            },
            /**
             * 获取职工余额
             */
            getBalance() {
                let that = this
                if (this.hasBind) {
                    this.$httpForm.post('/wechat/employee/getBalance.json', {
                        id: that.employee.id
                    }).then((res) => {
                        if (res.data.code == 'SUCCESS') {
                            that.qbBalance = formatter.formatMoney(res.data.data.qbBalance)
                            that.tbBalance = formatter.formatMoney(res.data.data.tbBalance)
                        } else {
                            that.qbBalance = formatter.formatMoney(0)
                            that.tbBalance = formatter.formatMoney(0)
                        }
                    }).catch((err) => {
                        console.log(err)
                    })
                }
            }
        },
        onLoad(option) {
            // #ifdef H5
            //授权回调如果带有code值则改变url
            if (window.location.href.indexOf('code') != -1) {
                let url = window.location.protocol + '//' + window.location.host + '/#/';
                window.history.replaceState({}, 0, url)
            }
            // #endif
        },
        onShow() {
            this.getBalance()
        }
    }
</script>

<style>
    .title {
        padding: 10px 0 0 0;
        width: 100%;
        height: 40px;
        text-align: center;
        background-color: #FFFFFF;
        position: fixed;
        top: 0px;
        z-index: 999;
    }

    .menu-card {
        margin: 50px 10px 10px 10rpx;
        background-color: rgba(85, 170, 255, 127) !important;
        border-radius: 10px !important;
    }

    .card-item {
        margin-left: 30rpx;
    }

    .image {
        width: 50rpx;
        height: 50rpx;
    }

    .text {
        font-size: 26rpx;
        margin-top: 10rpx;
    }

    .grid-item-box {
        flex: 1;
        /* position: relative; */
        /* #ifndef APP-NVUE */
        display: flex;
        /* #endif */
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 15px 0;
    }
</style>
