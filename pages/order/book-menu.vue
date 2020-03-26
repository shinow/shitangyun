<template>
    <view>
        <uni-nav-bar left-icon="back" left-text="返回" title="预约订餐" :fixed="true" :status-bar="true" @clickLeft="back"></uni-nav-bar>
        <view class="uni-media-list">
            <image class="uni-media-list-logo" src="/static/image/sample.png"></image>
            <view class="uni-media-list-body">
                <view class="uni-media-list-text-top">{{ rest.storeName }}</view>
                <view>
                    <view>预约时间：{{ orderDate }}</view>
                    <view>预约餐次：{{ busiName }}</view>
                </view>
            </view>
        </view>

        <view class="list_box">
            <view class="left">
                <scroll-view scroll-y="true" :style="{ 'height':scrollHeight }">
                    <view class="item" v-for="(item,index) in leftArray" :key="index" :class="{ 'active':index==leftIndex }"
                        :data-index="index" @tap="leftTap">{{item}}</view>
                </scroll-view>
            </view>
            <view class="main">
                <swiper class="swiper" :style="{ 'height':scrollHeight }" :current="leftIndex" @change="swiperChange"
                    vertical="true" duration="300">
                    <swiper-item v-for="(item,index) in mainArray" :key="index">
                        <scroll-view scroll-y="true" :style="{ 'height':scrollHeight }">
                            <view class="item">
                                <view class="title">
                                    <view>{{item.title}}</view>
                                </view>
                                <view class="goods" v-for="(item2,index2) in item.list" :key="index2">
                                    <image src="/static/image/sample.png" mode=""></image>
                                    <view>
                                        <view>{{ item2.name }}</view>
                                        <view class="describe">{{ item2.intro }}</view>
                                        <view class="money">现价:{{ item2.currentPrice | moneyFilter }} 原价:{{ item2.originalPrice | moneyFilter }}</view>
                                    </view>
                                    <view class="uni-flex" style="margin-left: 50rpx;">
                                        <view class="uni-flex-item">
                                            <uni-icons v-if="cart[index][index2] > 0" type="minus-filled" size="20"
                                                @click="reduceCart(index, index2)"></uni-icons>
                                        </view>
                                        <view class="uni-flex-item">
                                            <text v-if="cart[index][index2] > 0">{{ cart[index][index2] }}</text>
                                        </view>
                                        <view class="uni-flex-item">
                                            <uni-icons type="plus-filled" size="20" @click="addCart(index, index2)"></uni-icons>
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </scroll-view>
                    </swiper-item>
                </swiper>
            </view>
        </view>

        <view class="uni-flex cart">
            <view class="uni-flex-item" @click="showCartList">
                <uni-icons type="cart-filled" size="30"></uni-icons>
            </view>
            <view class="uni-flex-item">
                <uni-badge :text="cartTotalNum" type="error" size="small"></uni-badge>
                <text v-if="foodCartList.length > 0">￥{{ totalPrice | moneyFilter }}</text>
                <text v-else>未选购商品</text>
            </view>
            <view class="uni-flex-item">
            </view>
            <view class="uni-flex-item">
                <button type="primary" @click="toPay" :disabled="payDisabled">去结算</button>
            </view>
        </view>

        <!-- 更多选择 -->
        <popup-layer ref="popupMore" direction="top" v-model="showMoreChoice">
            <view style="width: 100%;height: 600rpx;">
                <view class="uni-media-list">
                    <image class="uni-media-list-logo" src="/static/image/sample.png"></image>
                    <view class="uni-media-list-body">
                        <view class="uni-media-list-text-top">{{ current.food.name }}</view>
                        <view class="uni-media-list-text-bottom">
                            <view>￥{{ calFoodPriceMethod() }}</view>
                        </view>
                    </view>
                </view>

                <view v-for="(item4, index4) in current.attrs" :key="index4">
                    <view class="uni-flex">
                        <view class="uni-flex-item">
                            {{ item4.name }} {{ item4.isMulti | multiFliter }}
                        </view>
                    </view>
                    <view class="uni-flex">
                        <view class="uni-flex-item" v-for="(item5, index5) in item4.subAttrs" :key="index5" :class="item5.checked?'active':''">
                            <view @click="checkAttr(index4, index5)">
                                {{ item5.name }}
                            </view>
                        </view>
                    </view>
                </view>

                <button type="primary" @click="choiceDone">选好了</button>
            </view>
        </popup-layer>

        <!-- 购物车popup -->
        <popup-layer ref="popupCart" @closeCallBack="closeCart" :offset="cartNavHeight" direction="top" v-model="showMoreChoice">
            <view style="width: 100%;padding-bottom: 30rpx;overflow: auto;">
                <view class="uni-flex" style="background-color: #F8F8F8">
                    <view class="uni-flex-item">
                        <text>已选商品</text>
                    </view>
                    <view class="uni-flex-item">
                    </view>
                    <view class="uni-flex-item">
                        <text @click="clearCart">清空</text>
                    </view>
                </view>

                <view style="background-color: #FFFFFF;" v-for="(item3, index3) in foodCartList" :key="index3">
                    <view class="uni-flex uni-row">
                        <view class="uni-flex-item">
                            <text>{{ item3.name }}</text>
                        </view>
                        <view class="uni-flex-item">
                            <text>单价：￥{{ item3.realPrice}} </text>
                        </view>
                        <view class="uni-flex-item">
                            <text style="color: #F76260;">总价：￥{{ getFoodTotalPrice(item3.realPrice, item3.num) | moneyFilter }}</text>
                        </view>
                        <view class="uni-flex-item">
                            <view class="uni-flex">
                                <view class="uni-flex-item">
                                    <uni-icons v-if="item3.num > 0" type="minus-filled" size="20" @click="reduceCartWithFood(index3)"></uni-icons>
                                </view>
                                <view class="uni-flex-item">
                                    <text v-if="item3.num > 0">{{ item3.num }}</text>
                                </view>
                                <view class="uni-flex-item">
                                    <uni-icons type="plus-filled" size="20" @click="addCartWithFood(index3)"></uni-icons>
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="uni-flex uni-row">
                        <view class="uni-flex-item">
                            <text>{{ item3.attrDesc }}</text>
                        </view>
                        <view class="uni-flex-item">
                        </view>
                        <view class="uni-flex-item">
                        </view>
                        <view class="uni-flex-item">
                        </view>
                    </view>
                </view>
            </view>
        </popup-layer>
    </view>
</template>

<script>
    import popupLayer from '@/components/popup-layer/popup-layer'
    import db from '@/utils/localstorage'
    import * as math from 'mathjs'
    import formatter from '@/common/formatter'

    export default {
        filters: {
            multiFliter(isMulti) {
                if (isMulti === 1) {
                    return '(多选)'
                } else {
                    return '(单选)'
                }
            },
            moneyFilter(money) {
            	return formatter.formatMoney(money)
            }
        },
        components: {
            popupLayer
        },
        data() {
            return {
                rest: {},
                orderDate: '',
                busiName: '',
                busiTimeId: '',
                scrollHeight: '500px',
                leftArray: [],
                mainArray: [],
                leftIndex: 0,
                showMoreChoice: false,
                isTopCart: false,
                foodCartList: [],
                cart: [],
                current: {
                    isDone: false,
                    totalPrice: 0,
                    food: {},
                    catIndex: 0,
                    foodIndex: 0,
                    attrs: []
                },
                cartTotalNum: 0
            }
        },
        computed: {
            cartNavHeight() {
                return uni.upx2px(100);
            },
            totalPrice() {
                let totalPrice = 0
                for (let i in this.foodCartList) {         
                    totalPrice = math.add(math.bignumber(totalPrice), math.multiply(math.bignumber(this.foodCartList[i].realPrice), this.foodCartList[i].num)).valueOf()
                }
                return totalPrice
            },
            payDisabled() {
                if (this.cartTotalNum <= 0) {
                    return true
                }
                return false
            }
        },
        methods: {
            back() {
                uni.navigateBack({
                    delta: 1
                })
            },
            /* 获取列表数据 */
            getListData() {
                let that = this
                new Promise((resolve, reject) => {
                    uni.showLoading()
                    let [left, main] = [
                        [],
                        []
                    ]
                    that.$http.get('/wechat/restaurant/foodCategory.json', {
                        data: {
                            restaurantId: that.rest.id,
                        }
                    }).then((res) => {
                        if (res.data.rows) {
                            const rows = res.data.rows
                            for (let i = 0; i < rows.length; i++) {
                                left.push(rows[i].categoryName)
                                main.push({
                                    title: rows[i].categoryName,
                                    list: rows[i].foodList
                                })
                            }
                        }
                        resolve({
                            left,
                            main
                        })
                    }).catch((err) => {
                        resolve({
                            left,
                            main
                        })
                    })
                }).then((res) => {
                    console.log('-----------获取菜品返回数据-------------');
                    console.log(res)
                    uni.hideLoading()
                    this.leftArray = res.left
                    this.mainArray = res.main
                    this.initCartContainer(res.main)
                })
            },
            /* 左侧导航点击 */
            leftTap(e) {
                let index = e.currentTarget.dataset.index
                this.leftIndex = Number(index)
            },
            /* 轮播图切换 */
            swiperChange(e) {
                let index = e.detail.current
                this.leftIndex = Number(index)
            },
            showCartList() {
                this.isTopCart = true
                this.$refs.popupCart.show()
            },
            closeCart() {
                this.isTopCart = false
            },
            //计算价格
            calFoodPriceMethod() {
                let food = this.current.food
                let realPrice = food.currentPrice
                for (let i in this.current.attrs) {
                    for (let j in this.current.attrs[i].subAttrs) {
                        let subAttr = this.current.attrs[i].subAttrs[j]
                        if (subAttr.checked) {
                            realPrice = math.add(math.bignumber(realPrice), math.bignumber(subAttr.price)).valueOf()
                        }
                    }
                }
                return realPrice
            },
            //初始化商品存在不同规格时的选中
            initFirstChoice() {
                for (let i in this.current.attrs) {
                    for (let j in this.current.attrs[i].subAttrs) {
                        if (this.current.attrs[i].subAttrs[j].isDefault == 1) {
                            this.current.attrs[i].subAttrs[j].checked = true
                        } else {
                            this.current.attrs[i].subAttrs[j].checked = false
                        }
                    }
                }
            },
            //选中规格
            checkAttr(index4, index5) {
                if (this.current.attrs[index4].isMulti == 1) {
                    this.current.attrs[index4].subAttrs[index5].checked = !this.current.attrs[index4].subAttrs[index5].checked
                } else {
                    for (let i in this.current.attrs[index4].subAttrs) {
                        this.current.attrs[index4].subAttrs[i].checked = false
                    }
                    this.current.attrs[index4].subAttrs[index5].checked = true
                }
                this.$forceUpdate()
            },
            hasAttrs(catIndex, foodIndex) {
                const foodAddList = this.mainArray[catIndex].list[foodIndex].foodAddList
                if (foodAddList.length > 0) {
                    return true
                } else {
                    return false
                }
            },
            generateAttrs(foodAddList) {
                let attrs = []
                for (let i in foodAddList) {
                    let attr = {}
                    attr.name = foodAddList[i].name
                    attr.isMulti = foodAddList[i].isMulti
                    let subAttrs = []
                    for (let j in foodAddList[i].foodAddDetailList) {
                        let sAttr = {}
                        sAttr.name = foodAddList[i].foodAddDetailList[j].name
                        sAttr.price = foodAddList[i].foodAddDetailList[j].price
                        sAttr.isDefault = foodAddList[i].foodAddDetailList[j].isDefault
                        subAttrs.push(sAttr)
                    }
                    attr.subAttrs = subAttrs
                    attrs.push(attr)
                }
                return attrs
            },
            addCart(index, index2) {
                this.current.catIndex = index
                this.current.foodIndex = index2
                this.current.food = this.mainArray[index].list[index2]
                this.current.attrs = this.generateAttrs(this.mainArray[index].list[index2].foodAddList)
                if (this.hasAttrs(index, index2)) {
                    console.log("弹出更多选择框")
                    this.initFirstChoice()
                    this.$refs.popupMore.show()
                } else {
                    console.log("直接添加")
                    this.pushFoodToCart()
                }
            },
            pushFoodToCart() {
                const catIndex = this.current.catIndex
                const foodIndex = this.current.foodIndex
                this.cart[catIndex][foodIndex]++
                this.cartTotalNum++
                const food = this.mainArray[catIndex].list[foodIndex]
                let obj = {}
                Object.assign(obj, food)
                obj.catIndex = catIndex
                obj.foodIndex = foodIndex
                obj.realPrice = this.calFoodPriceMethod()
                obj.num = 1
                obj.attrs = JSON.parse(JSON.stringify(this.current.attrs))
                obj.attrDesc = this.extraAttrDesc(this.current)
                const i = this.getIndexInCart(obj)
                if (i != -1) {
                    this.foodCartList[i].num++
                } else {
                    this.foodCartList.push(obj)
                }
            },
            //在购物车添加
            addCartWithFood(i) {
                const food = this.foodCartList[i]
                this.foodCartList[i].num++
                this.cart[food.catIndex][food.foodIndex]++
                this.cartTotalNum++
            },
            reduceCart(index, index2) {
                let that = this
                let res = this.checkDifferentExists(index, index2)
                if (res.isExists) {
                    uni.showModal({
                        title: "提示",
                        content: "存在不同规格的商品，请进入购物车中移除。",
                        showCancel: false,
                        success: (res) => {
                            if (res.confirm) {
                                if (that.cartTotalNum > 0) {
                                    that.$refs.popupCart.show()
                                }
                            }
                        }
                    })
                    return
                }
                this.reduceCartWithFood(res.firstIndex)
            },
            reduceCartWithFood(cartFoodIndex) {
                let food = this.foodCartList[cartFoodIndex]
                this.foodCartList[cartFoodIndex].num--
                this.cartTotalNum--
                this.cart[food.catIndex][food.foodIndex]--
                if (this.foodCartList[cartFoodIndex].num <= 0) {
                    this.foodCartList.splice(cartFoodIndex, 1)
                }
                if (this.cartTotalNum <= 0) {
                    this.$refs.popupCart.close()
                }
            },
            //检测是否有不同规格的商品在购物车
            checkDifferentExists(catIndex, foodIndex) {
                let flag = 0
                let res = {
                    firstIndex: -1,
                    isExists: false
                }
                for (let i in this.foodCartList) {
                    let food = this.foodCartList[i]
                    if (food.catIndex == catIndex && food.foodIndex == foodIndex) {
                        if (flag == 0) {
                            res.firstIndex = i
                        }
                        flag++
                    }
                }
                res.isExists = flag > 1
                return res
            },
            getIndexInCart(obj) {
                const i = this.foodCartList.findIndex(function(ele) {
                    return (ele.id == obj.id) && (JSON.stringify(ele.attrs) == JSON.stringify(obj.attrs))
                })
                return i
            },
            extraAttrDesc(current) {
                let desc = '';
                for (let i in current.attrs) {
                    for (let j in current.attrs[i].subAttrs) {
                        let attr = current.attrs[i].subAttrs[j];
                        if (attr.checked) {
                            desc += `${attr.name} / `;
                        }
                    }
                }
                if (desc == '') {
                    return this.mainArray[current.catIndex].list[current.foodIndex].unit;
                } else {
                    return desc.substr(0, desc.length - 2);
                }
            },
            /**
             * 多选
             */
            choiceDone() {
                this.pushFoodToCart()
                this.$refs.popupMore.close()
            },
            //清空购物车
            clearCart() {
                this.initCartContainer(this.mainArray)
                this.foodCartList = []
                this.cartTotalNum = 0
                this.$refs.popupCart.close()
            },
            //初始化商品列表的数量显示
            initCartContainer(mainArray) {
                for (let i in mainArray) {
                    this.cart[i] = []
                    for (let j in mainArray[i].list) {
                        this.cart[i][j] = 0
                    }
                }
            },
            //跳转到结算页
            toPay() {
                let cartInfo = {}
                cartInfo.orderDate = this.orderDate
                cartInfo.busiName = this.busiName
                cartInfo.cartFood = this.foodCartList
                db.save('cartInfo', cartInfo)
                uni.navigateTo({
                    url: '/pages/order/book-pay'
                })
            },
            //格式化每个商品实际价格乘以数量的总价
            getFoodTotalPrice(price, num) {
                return math.multiply(math.bignumber(price), num)
            }
        },
        onLoad(option) {
            this.rest = db.get('rest')
            if (option) {
                this.orderDate = option.orderDate
                this.busiName = option.busiName
                this.busiTimeId = option.busiTimeId
            }
            this.getListData()
            /* 设置当前滚动容器的高，若非窗口的高度，请自行修改 */
            uni.getSystemInfo({
                success: (res) => {
                    this.scrollHeight = `${res.windowHeight - 220}px`
                }
            })
        },
        onShow() {
            //this.getListData()
        }
    }
</script>

<style lang="scss">
    .uni-media-list {
        width: 100%;
        height: 120px;

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
    }

    .list_box {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: flex-start;
        align-content: flex-start;
        font-size: 50rpx;

        .left {
            width: 200rpx;
            background-color: #f6f6f6;
            line-height: 80rpx;
            box-sizing: border-box;
            font-size: 50rpx;

            .item {
                padding-left: 20rpx;
                position: relative;

                &:not(:first-child) {
                    margin-top: 1px;

                    &::after {
                        content: '';
                        display: block;
                        height: 0;
                        border-top: #d6d6d6 solid 1px;
                        width: 620upx;
                        position: absolute;
                        top: -1px;
                        right: 0;
                        transform: scaleY(0.5);
                        /* 1px像素 */
                    }
                }

                &.active,
                &:active {
                    color: #42b983;
                    background-color: #fff;
                }
            }
        }

        .main {
            background-color: #fff;
            padding-left: 20rpx;
            width: 0;
            flex-grow: 1;
            box-sizing: border-box;

            .swiper {
                height: 500px;
            }

            .title {
                line-height: 64rpx;
                font-size: 24rpx;
                font-weight: bold;
                color: #666;
                background-color: #fff;
                position: sticky;
                top: 0;
                z-index: 999;
            }

            .item {
                padding-bottom: 10rpx;
            }

            .goods {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: flex-start;
                align-items: center;
                align-content: center;
                margin-bottom: 10rpx;

                &>image {
                    width: 120rpx;
                    height: 120rpx;
                    margin-right: 16rpx;
                    margin-left: 2px;
                }

                .describe {
                    font-size: 24rpx;
                    color: #999;
                }

                .money {
                    font-size: 24rpx;
                    color: #efba21;
                }
            }
        }
    }

    .cart {
        height: 100rpx;
        position: fixed;
        bottom: 0;
        width: 100%;

        &.top-layer {
            z-index: 9999999;
        }
    }

    .active {
        background-color: #0A98D5;
    }
</style>
