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
				<text>报餐餐厅：{{ storeName }}</text>
			</view>
			<view class="uni-flex-item">
				<button class="mini-btn" type="primary" size="mini" @click="toBaocan">继续报餐</button>
			</view>
			<view class="uni-flex-item">
				<button class="mini-btn" type="default" size="mini" @click="toIndex">完成报餐</button>
			</view>
		</view>
	</view>
</template>

<script>
	import formatter from '@/common/formatter'
    import * as math from 'mathjs'
	
	export default {
		filters: {
			moneyFilter(totalMoney) {
				return formatter.formatMoney(math.chain(totalMoney).divide(100).done())
			}
		},
		data() {
			return {
				storeName: '',
				totalMoney: 0
			}
		},
		methods: {
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
			toBaocan() {
				uni.navigateBack({
					delta: 1
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
				this.totalMoney = option.totalMoney
			}
		}
	}
</script>

<style>
</style>
