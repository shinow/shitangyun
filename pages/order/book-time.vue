<template>
	<view>
		<uni-nav-bar left-icon="back" left-text="返回" :title="rest.storeName" :fixed="true" :status-bar="true" @clickLeft="back"></uni-nav-bar>
		<view class="uni-media-list">
			<image class="uni-media-list-logo" src="/static/image/sample.png"></image>
			<view class="uni-media-list-body">
				<view class="uni-media-list-text-top">{{ rest.storeName }}</view>
				<view class="uni-media-list-text-bottom">
					<text v-for="(bt, i) in rest.businessTime" :key="i">
						{{ bt.busiName }}: {{bt.startTime}}-{{bt.endTime}}
					</text>
				</view>
			</view>
		</view>
		<view v-for="(item, index) in list" :key="index">
			<view class="uni-flex uni-row">
				<view>
					{{ item.weekDay }}
				</view>
				<view>
					{{ item.date }}
				</view>
			</view>
			<view v-if="item.isShow" class="uni-flex uni-row">
				<view class="uni-flex" v-for="(bt, i) in item.businessTime" :key="i" @click="changeCheck(bt, item.date)">
					<view v-if="bt.isOrder">
						<image style="width: 60rpx; height: 60rpx;" src="/static/image/sample.png"></image>
						<text>{{ bt.busiName }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import util from '@/utils/util'
	import formatter from '@/common/formatter'
	import db from '@/utils/localstorage'
	import {
		mapState
	} from 'vuex'

	export default {
		filters: {
			moneyFilter(money) {
				return formatter.formatMoney(money)
			}
		},
		data() {
			return {
				checkStyle: '#ffaa00',
				unCheckStyle: '#e1e1e1',
				rest: {},
				list: [],
				orderMenu: {},
				restConfig: {}
			}
		},
		computed: mapState(['hasBind', 'employee']),
		methods: {
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
			changeCheck(bt, str) {
				let date = this.$moment(str).toDate()
				const orderTimeConfig = JSON.parse(this.restConfig.orderTimeConfig)
				if (orderTimeConfig) {
					const rule = orderTimeConfig.find(function(ele) {
						return ele.busiName == bt.busiName
					})
					if (rule) {
						if (rule.arrange) {
							const arr = rule.arrange.split('-')
							const sTime = arr[0].split(':')
							const eTime = arr[1].split(':')
							let start = date.setHours(sTime[0], Number(sTime[1]) - Number(rule.orderDeadline))
							let end = date.setHours(eTime[0], eTime[1])
							if (new Date().getTime() > start) {
								uni.showToast({
									title: '订餐时间已过',
									duration: 2000,
									icon: 'none'
								})
								return
							}
						}
					}
				}
				let url = '/pages/order/book-menu?orderDate=' + str + '&busiName=' + bt.busiName + '&busiTimeId=' + bt.busiTimeId
				uni.navigateTo({
					url: url
				})
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
						that.getOrderMenu(res.data.entity, id)
					}
				})
			},
			/**
			 * 根据门店id获取订餐菜单
			 * 
			 * @param {Object} id
			 */
			getOrderMenu(restConfig, id) {
				let that = this
				this.$http.get('/wechat/restaurant/orderMenu.json', {
					data: {
						restaurantId: id,
						type: 2
					}
				}).then((res) => {
					if (res.data.entity) {
						if (res.data.entity) {
							that.orderMenu = res.data.entity
							that.generateConfigList(restConfig, res.data.entity)
						}
					}
				})
			},
			/**
			 * 生成订餐日期列表
			 * 
			 * @param {Object} restConfig
			 * @param {Object} orderMenu
			 */
			generateConfigList(restConfig, orderMenu) {
				let that = this
				let list = []
				const weekDayList = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
				// useSlot 1按日期 2按周
				if (orderMenu.useSlot === 1) {
					const dateArr = util.getDateRange(orderMenu.beginTime, orderMenu.endTime)
					dateArr.forEach((item) => {
						let obj = {}
						obj.date = item
						obj.weekDay = weekDayList[this.$moment(item).day()]
						const orderTime = JSON.parse(orderMenu.orderTime)
						const temp = orderTime.find(function(ele) {
							return that.$moment(ele.date).isSame(item)
						})
						if (temp) {
							obj.isShow = true
						} else {
							obj.isShow = false
						}
						obj.businessTime = that.generateBusinessTime(orderMenu)
						list.push(obj)
					})
				} else if (orderMenu.useSlot === 2) {
					//先生成当前时间后一周的日期数组
					const dateList = util.getDateList()
					dateList.forEach((item) => {
						let obj = {}
						obj.date = item
						obj.weekDay = weekDayList[that.$moment(item).day()]
						const orderWeekList = orderMenu.orderWeek.split(',')
						const index = orderWeekList.findIndex(function(ele) {
							return Number(ele) == that.$moment(item).day()
						})
						if (index != -1) {
							obj.isShow = true
						} else {
							obj.isShow = false
						}
						obj.businessTime = that.generateBusinessTime(orderMenu)
						list.push(obj)
					})
				}
				//如果生成配置天数大于预约天数则截取list的长度为预约天数的大小
				if (restConfig.orderDays && list.length > restConfig.orderDays) {
					list = list.slice(0, restConfig.orderDays)
				}
				this.list = list
				console.log(list)
			},
			/**
			 * 生成营业时间菜单
			 * 
			 * @param {Object} orderMenu
			 */
			generateBusinessTime(orderMenu) {
				let businessTime = []
				const btArr = this.rest.businessTime
				btArr.forEach((bt) => {
					let btObj = {}
					btObj.busiTimeId = bt.id
					btObj.busiName = bt.busiName
					btObj.checked = false
					const useTimeList = orderMenu.useTimeList
					const useEnable = useTimeList.find(function(ele) {
						return ele.busiName == bt.busiName
					})
					if (useEnable) {
						btObj.isOrder = true
					} else {
						btObj.isOrder = false
					}
					businessTime.push(btObj)
				})
				return businessTime
			}
		},
		onLoad(option) {
			this.rest = db.get('rest')
		},
		onShow() {
			this.getRestaurantConfig(this.rest.id)
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
