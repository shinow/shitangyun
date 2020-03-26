<template>
    <view>
        <uni-nav-bar left-icon="back" left-text="返回" title="订单备注" :fixed="true" :status-bar="true" @clickLeft="back" @clickRight="complete">
            <view slot="right" style="color: #0A98D5;">完成</view>
        </uni-nav-bar>

        <view class="uni-textarea" style="background-color: #EEEEEE;">
            <textarea :value="remark" placeholder-style="color:#D9D9D9" placeholder="填写对店家的备注" @input="changeRemark" />
        </view>
    </view>
</template>

<script>
    import db from '@/utils/localstorage'
    
    export default {
        data() {
            return {
                remark: ''
            }
        },
        methods: {
            back() {
                uni.navigateBack({
                    delta: 1
                })
            },
            complete() {
                db.save('remark', this.remark)
                uni.navigateBack({
                    delta: 1
                })
            },
            changeRemark(e) {
                this.remark = e.detail.value
            }
        },
         onShow() {
             const remark = db.get('remark', '')
             this.remark = remark
         }
    }
</script>

<style>
</style>
