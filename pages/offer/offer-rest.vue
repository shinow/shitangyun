<template>
	<view>
		<uni-nav-bar left-icon="back" left-text="返回" title="在线报餐" :fixed="true" :status-bar="true" @clickLeft="back"></uni-nav-bar>
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
	import { mapState } from 'vuex'

	export default {
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
				}
			}
		},
		computed: mapState(['employee']),
		methods: {
			detail(item) {
				if(item.orderFlag == 0) {
					uni.showToast({
						title: '该门店暂未开通报餐',
						icon: 'none',
						duration: 2000
					});
					return
				}
				db.save('rest', item)
				uni.navigateTo({
					url: '/pages/offer/offer-time'
				})
			},
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
			getRestList() {
				let that = this
				this.$http.get('/wechat/restaurant/list.json', {
					data: {
						mchId: that.employee.mchId,
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
			}
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
