<template>
    <view>
        <uni-nav-bar left-icon="back" left-text="返回" title="我的预约" :fixed="true" :status-bar="true" @clickLeft="back"></uni-nav-bar>
        
        <uni-list>
            <uni-list-item v-for="(item, index) in list" :key="index" @click="toOrderList(item)" :title="item.date" :note="getNote(item.orderNum)" :show-extra-icon="true" :extra-icon="{color: '#4cd964',size: '22',type: 'list'}">
            </uni-list-item>
        </uni-list>
    </view>
</template>

<script>
    import { mapState } from 'vuex'
    import util from '@/utils/util'
    
    export default {
        data() {
            return {
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
            toOrderList(item) {
                if (item.orderNum > 0) {
                    uni.navigateTo({
                        url: '/pages/order/order-list?orderDate=' + item.date
                    })
                }
            },
            initOrder() {
                let that = this
                this.$httpForm.post('/wechat/order/listNextWeek.json', {
                	buyerId: that.employee.id
                }).then((res) => {
                	if (res.data.rows) {
                        that.generateOneWeekOrder(res.data.rows)
                	}
                })
            },
            generateOneWeekOrder(orderList) {
                let list = []
                //先生成当前时间后一周的日期数组
                const dateList = util.getDateList()
                dateList.forEach((item) => {
                    let obj = {}
                    obj.date = item 
                    const arr = orderList.filter(function(ele) {
                        return ele.orderingTime == item
                    })
                    obj.orderNum = arr.length
                    list.push(obj)
                })
                this.list = list
            },
            getNote(orderNum) {
                return `已预约${orderNum}单`
            }
        },
        onLoad(option) {
            
        },
        onShow() {
            this.initOrder()
        }
    }
</script>

<style>
</style>
